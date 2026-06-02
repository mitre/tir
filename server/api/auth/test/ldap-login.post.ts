import { Client, type Entry } from "ldapts";
import { GroupClaimExtractor } from "~/server/auth/groupClaimExtractor";
import { getRawConfigValue } from "~/server/utils/config/tirConfig";

const CONNECT_TIMEOUT_MS = 10_000;
const UAC_ACCOUNT_DISABLED = 0x0002;

function escapeFilter(value: string): string {
  return value
    .replace(/\\/g, "\\5c")
    .replace(/\0/g, "\\00")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\*/g, "\\2a");
}

function firstAttr(val: unknown, fallback = ""): string {
  if (Array.isArray(val)) return (val[0] as string) || fallback;
  return (val as string) || fallback;
}

function allAttrs(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  return val ? [val as string] : [];
}

function domainFromBaseDn(baseDn: string): string {
  return baseDn
    .split(",")
    .filter((p) => p.trim().toLowerCase().startsWith("dc="))
    .map((p) => p.trim().slice(3))
    .join(".");
}

function resolveRoleQuiet(groupMappings: string, groups: string[]): number | null {
  const raw = (groupMappings || "").trim();
  if (!raw) return null;
  const extractor = new GroupClaimExtractor({
    mode: "claim",
    claimPath: "",
    groupRoleMappings: GroupClaimExtractor.parseGroupMappings(raw, "|"),
  });
  const roleIds = extractor.getAllMatchingRoles(groups);
  if (roleIds.includes(2)) return 2;
  if (roleIds.includes(1)) return 1;
  return null;
}

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const body = await readBody(event);
  const {
    id,
    url,
    bindDn,
    password: providedBindPassword,
    baseDn,
    ssl,
    sslInsecure,
    sslCa,
    template,
    groupAttribute,
    groupMappings,
    username,
    testPassword,
  } = body;

  if (!username || !testPassword) {
    throw createError({ statusCode: 400, message: "Username and password are required." });
  }
  if (!url || !bindDn || !baseDn) {
    throw createError({ statusCode: 400, message: "Provider configuration is incomplete." });
  }

  let bindPassword: string | undefined = providedBindPassword;
  if (!bindPassword && id) {
    const stored = await getRawConfigValue(`auth:ldap:${id}:password`);
    if (stored) bindPassword = stored;
  }

  if (!bindPassword) {
    throw createError({ statusCode: 400, message: "Bind password is required — enter it in the Password field or save the config first." });
  }

  const clientOptions: any = { url, connectTimeout: CONNECT_TIMEOUT_MS };
  if (ssl) {
    if (sslInsecure) {
      clientOptions.tlsOptions = { rejectUnauthorized: false };
    } else if (sslCa) {
      clientOptions.tlsOptions = { ca: sslCa };
    } else {
      clientOptions.tlsOptions = {};
    }
  }

  const attr = groupAttribute || "memberOf";
  const client = new Client(clientOptions);

  try {
    await client.bind(bindDn, bindPassword);

    let ldapUser: Entry;

    if (template === "msad") {
      const escaped = escapeFilter(username);
      const { searchEntries } = await client.search(baseDn, {
        scope: "sub",
        filter: `(|(sAMAccountName=${escaped})(userPrincipalName=${escaped}))`,
        attributes: ["dn", "sAMAccountName", "userPrincipalName", "displayName", "givenName", "sn", "mail", "userAccountControl", attr],
      });

      if (searchEntries.length !== 1) {
        throw createError({ statusCode: 404, message: `User not found or not unique: ${username}` });
      }

      ldapUser = searchEntries[0] as Entry;

      const uac = Number.parseInt(ldapUser.userAccountControl as string, 10);
      if (!Number.isNaN(uac) && uac & UAC_ACCOUNT_DISABLED) {
        throw createError({ statusCode: 403, message: "Account is disabled in Active Directory." });
      }
    } else {
      const { searchEntries } = await client.search(baseDn, {
        scope: "sub",
        filter: `(uid=${escapeFilter(username)})`,
        attributes: ["dn", "cn", "sn", "givenName", "mail", attr],
      });

      if (searchEntries.length !== 1) {
        throw createError({ statusCode: 404, message: `User not found or not unique: ${username}` });
      }

      ldapUser = searchEntries[0] as Entry;
    }

    await client.bind(ldapUser.dn, testPassword);

    const groups = allAttrs(ldapUser[attr]).map((g) => g.toLowerCase());

    const userRoleId = resolveRoleQuiet(groupMappings, groups);
    const denied = (groupMappings || "").trim().length > 0 && userRoleId === null;

    let email: string;
    let firstName: string;
    let lastName: string;

    if (template === "msad") {
      const displayName = firstAttr(ldapUser.displayName);
      firstName = firstAttr(ldapUser.givenName) || displayName.split(" ")[0] || username;
      lastName = firstAttr(ldapUser.sn) || displayName.split(" ").slice(1).join(" ") || "Unknown";
      email = firstAttr(ldapUser.mail) || firstAttr(ldapUser.userPrincipalName);
      if (!email || !email.includes("@")) {
        const domain = domainFromBaseDn(baseDn);
        const sam = firstAttr(ldapUser.sAMAccountName) || username;
        email = domain ? `${sam}@${domain}` : `${sam}@example.com`;
      }
    } else {
      firstName = firstAttr(ldapUser.givenName, username);
      lastName = firstAttr(ldapUser.sn, "Unknown");
      const mails = allAttrs(ldapUser.mail).filter(Boolean);
      email = mails.length ? mails[0] : `${username}@example.com`;
    }

    return { ok: true, email, firstName, lastName, groups, userRoleId, denied };
  } catch (err: any) {
    if (err.statusCode) throw err;
    throw createError({ statusCode: 401, message: err.message ?? "Authentication failed." });
  } finally {
    try { await client.unbind(); } catch {}
  }
});

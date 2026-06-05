import { Client, type Entry } from "ldapts";
import { H3Event, H3Error } from "h3";
import { AuthProvider } from "./authProvider";
import { GroupClaimExtractor } from "./groupClaimExtractor";
import type { LDAPProviderConfig } from "~/types/auth";

const CONNECT_TIMEOUT_MS = 10_000;
const UAC_ACCOUNT_DISABLED = 0x0002;

// RFC 4515 -- escape special characters in LDAP filter values
function escapeFilter(value: string): string {
  return value
    .replace(/\\/g, "\\5c")
    .replace(/\0/g, "\\00")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\*/g, "\\2a");
}

function domainFromBaseDn(baseDn: string): string {
  return baseDn
    .split(",")
    .filter((p) => p.trim().toLowerCase().startsWith("dc="))
    .map((p) => p.trim().slice(3))
    .join(".");
}

function firstAttr(val: unknown, fallback = ""): string {
  if (Array.isArray(val)) return (val[0] as string) || fallback;
  return (val as string) || fallback;
}

function allAttrs(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  return val ? [val as string] : [];
}

function buildClientOptions(config: LDAPProviderConfig): any {
  const opts: any = { url: config.url, connectTimeout: CONNECT_TIMEOUT_MS };
  if (config.ssl) {
    if (config.sslInsecure) {
      opts.tlsOptions = { rejectUnauthorized: false };
    } else if (config.sslCa) {
      opts.tlsOptions = { ca: config.sslCa };
    } else {
      opts.tlsOptions = {};
    }
  }
  return opts;
}

export class LDAPAuthProvider extends AuthProvider {
  private readonly config: LDAPProviderConfig & { password?: string };

  constructor(config: LDAPProviderConfig & { password?: string }) {
    super();
    this.config = config;
  }

  async init(): Promise<void> {}

  private resolveGroupRole(groups: string[]): number | null {
    const mappingsRaw = (this.config.groupMappings || "").trim();
    if (!mappingsRaw) return null;
    const extractor = new GroupClaimExtractor({
      mode: "claim",
      claimPath: "",
      groupRoleMappings: GroupClaimExtractor.parseGroupMappings(mappingsRaw, "|"),
    });
    const roleIds = extractor.getAllMatchingRoles(groups);
    if (roleIds.includes(2)) return 2;
    if (roleIds.includes(1)) return 1;
    return null;
  }

  async authenticate(event: H3Event, credentials: any): Promise<any> {
    if (this.config.template === "msad") {
      return this.authenticateMSAD(event, credentials);
    }
    return this.authenticateOpenLDAP(event, credentials);
  }

  private async authenticateOpenLDAP(event: H3Event, credentials: any): Promise<any> {
    const { username, password } = credentials;
    const { bindDn, password: ldapPassword, baseDn } = this.config;

    if (!this.config.url || !bindDn || !ldapPassword || !baseDn) {
      throw new H3Error("LDAP configuration is incomplete.");
    }

    const groupAttr = this.config.groupAttribute || "memberOf";
    const client = new Client(buildClientOptions(this.config));

    try {
      await client.bind(bindDn, ldapPassword);

      const { searchEntries } = await client.search(baseDn, {
        scope: "sub",
        filter: `(uid=${escapeFilter(username)})`,
        attributes: ["dn", "cn", "sn", "givenName", "mail", groupAttr],
      });

      if (searchEntries.length !== 1) {
        logger.info({ service: "auth", message: `LDAP user not found or not unique: ${username}` });
        return null;
      }

      const ldapUser = searchEntries[0] as Entry;
      await client.bind(ldapUser.dn, password);

      logger.info({ service: "auth", message: `LDAP authentication successful for: ${username}` });

      const firstName = firstAttr(ldapUser.givenName, username);
      const lastName = firstAttr(ldapUser.sn, "Unknown");
      const mails = allAttrs(ldapUser.mail).filter(Boolean);
      const email = mails.length ? mails : [`${username}@example.com`];

      const groups = allAttrs(ldapUser[groupAttr]).map((g) => g.toLowerCase());
      const userRoleId = this.resolveGroupRole(groups);

      logger.info({
        service: "auth",
        message: `LDAP '${
          this.config.label
        }' group resolution for ${username} -- groups=${JSON.stringify(
          groups,
        )}, role=${userRoleId}`,
      });

      if ((this.config.groupMappings || "").trim() && userRoleId === null) {
        throw new H3Error("Unauthorized: You do not belong to any permitted groups.");
      }

      return this.finalizeLogin(event, { email, firstName, lastName }, "ldap", userRoleId);
    } catch (error: any) {
      if (error instanceof H3Error) throw error;
      logger.info({
        service: "auth",
        message: `LDAP auth failed for ${username}: ${error.message}`,
      });
      return null;
    } finally {
      await client.unbind();
    }
  }

  private async authenticateMSAD(event: H3Event, credentials: any): Promise<any> {
    const { username, password } = credentials;
    const { bindDn, password: ldapPassword, baseDn } = this.config;

    if (!this.config.url || !bindDn || !ldapPassword || !baseDn) {
      throw new H3Error("LDAP configuration is incomplete.");
    }

    const groupAttr = this.config.groupAttribute || "memberOf";
    const client = new Client(buildClientOptions(this.config));

    try {
      await client.bind(bindDn, ldapPassword);

      // Search by sAMAccountName or userPrincipalName - handle both domain\user and user@domain
      const escaped = escapeFilter(username);
      const filter = `(|(sAMAccountName=${escaped})(userPrincipalName=${escaped}))`;

      const { searchEntries } = await client.search(baseDn, {
        scope: "sub",
        filter,
        attributes: [
          "dn",
          "sAMAccountName",
          "userPrincipalName",
          "displayName",
          "givenName",
          "sn",
          "mail",
          "userAccountControl",
          groupAttr,
        ],
      });

      if (searchEntries.length !== 1) {
        logger.info({ service: "auth", message: `AD user not found or not unique: ${username}` });
        return null;
      }

      const adUser = searchEntries[0] as Entry;

      // Check disabled account flag (bit 1 of userAccountControl)
      const uac = Number.parseInt(adUser.userAccountControl as string, 10);
      if (!Number.isNaN(uac) && uac & UAC_ACCOUNT_DISABLED) {
        logger.info({
          service: "auth",
          message: `AD login rejected -- account disabled: ${username}`,
        });
        return null;
      }

      await client.bind(adUser.dn, password);

      logger.info({ service: "auth", message: `AD authentication successful for: ${username}` });

      const groups = allAttrs(adUser[groupAttr]).map((g) => g.toLowerCase());
      const userRoleId = this.resolveGroupRole(groups);

      logger.info({
        service: "auth",
        message: `AD '${
          this.config.label
        }' group resolution for ${username} -- groups=${JSON.stringify(
          groups,
        )}, role=${userRoleId}`,
      });

      if ((this.config.groupMappings || "").trim() && userRoleId === null) {
        throw new H3Error("Unauthorized: You do not belong to any permitted groups.");
      }

      const profile = this.extractADProfile(adUser, username, baseDn);
      return this.finalizeLogin(event, profile, "ldap", userRoleId);
    } catch (error: any) {
      if (error instanceof H3Error) throw error;
      logger.info({ service: "auth", message: `AD auth failed for ${username}: ${error.message}` });
      return null;
    } finally {
      await client.unbind();
    }
  }

  private extractADProfile(
    adUser: Entry,
    username: string,
    baseDn: string,
  ): { email: string; firstName: string; lastName: string } {
    const displayName = firstAttr(adUser.displayName);
    const firstName = firstAttr(adUser.givenName) || displayName.split(" ")[0] || username;
    const lastName = firstAttr(adUser.sn) || displayName.split(" ").slice(1).join(" ") || "Unknown";

    let email = firstAttr(adUser.mail) || firstAttr(adUser.userPrincipalName);
    if (!email?.includes("@")) {
      const domain = domainFromBaseDn(baseDn);
      const sam = firstAttr(adUser.sAMAccountName) || username;
      email = domain ? `${sam}@${domain}` : `${sam}@example.com`;
    }

    return { email, firstName, lastName };
  }

  async validateToken(_token: string): Promise<any> {
    return null;
  }
}

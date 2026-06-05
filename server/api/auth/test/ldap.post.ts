import { Client } from "ldapts";
import { getRawConfigValue } from "~/server/utils/config/tirConfig";

const CONNECT_TIMEOUT_MS = 8_000;

interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
}

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const body = await readBody(event);
  const { id, url, bindDn, password: providedPassword, baseDn, ssl, sslInsecure, sslCa } = body;

  if (!url) {
    return { ok: false, checks: [{ name: "Connect", ok: false, message: "URL is required" }] };
  }

  let password: string | undefined = providedPassword;
  if (!password && id) {
    const stored = await getRawConfigValue(`auth:ldap:${id}:password`);
    if (stored) password = stored;
  }

  const checks: CheckResult[] = [];

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

  const client = new Client(clientOptions);

  try {
    try {
      await client.bind("", "");
      checks.push({ name: "Connect", ok: true, message: "Connected (anonymous bind allowed)" });
    } catch (err: any) {
      const isLdapError = typeof err.code === "number" || err.name?.includes("Ldap");
      if (isLdapError) {
        checks.push({ name: "Connect", ok: true, message: `Server reachable (${err.message})` });
      } else {
        checks.push({ name: "Connect", ok: false, message: err.message ?? "Cannot connect to server" });
        return { ok: false, checks };
      }
    }

    if (bindDn && password) {
      try {
        await client.bind(bindDn, password);
        checks.push({ name: "Bind", ok: true, message: `Authenticated as ${bindDn}` });

        if (baseDn) {
          try {
            const { searchEntries } = await client.search(baseDn, {
              scope: "base",
              filter: "(objectClass=*)",
              attributes: ["dn"],
            });
            checks.push({
              name: "Base DN",
              ok: true,
              message: `Found ${searchEntries.length} entr${searchEntries.length === 1 ? "y" : "ies"} at ${baseDn}`,
            });
          } catch (err: any) {
            checks.push({ name: "Base DN", ok: false, message: err.message ?? "Search failed" });
          }
        } else {
          checks.push({ name: "Base DN", ok: false, message: "Not configured" });
        }
      } catch (err: any) {
        checks.push({ name: "Bind", ok: false, message: err.message ?? "Bind failed" });
      }
    } else if (bindDn) {
      checks.push({
        name: "Bind",
        ok: false,
        message: "No password available - enter a password to test bind",
      });
    } else {
      checks.push({ name: "Bind", ok: false, message: "Bind DN not configured" });
    }
  } finally {
    try {
      await client.unbind();
    } catch {}
  }

  return { ok: checks.every((c) => c.ok), checks };
});

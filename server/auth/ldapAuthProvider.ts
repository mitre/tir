import { Client, type Entry } from "ldapts";
import { H3Event, H3Error } from "h3";
import { AuthProvider } from "./authProvider";
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

function buildClientOptions(config: LDAPProviderConfig): any {
  const opts: any = { url: config.url, connectTimeout: CONNECT_TIMEOUT_MS };
  if (config.ssl) {
    opts.tlsOptions = config.sslInsecure
      ? { rejectUnauthorized: false }
      : config.sslCa
        ? { ca: config.sslCa }
        : {};
  }
  return opts;
}

export class LDAPAuthProvider extends AuthProvider {
  private config: LDAPProviderConfig & { password?: string };

  constructor(config: LDAPProviderConfig & { password?: string }) {
    super();
    this.config = config;
  }

  async init(): Promise<void> {}

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

    const client = new Client(buildClientOptions(this.config));

    try {
      await client.bind(bindDn, ldapPassword);

      const { searchEntries } = await client.search(baseDn, {
        scope: "sub",
        filter: `(uid=${escapeFilter(username)})`,
        attributes: ["dn", "cn", "sn", "givenName", "mail"],
      });

      if (searchEntries.length !== 1) {
        logger.info({ service: "auth", message: `LDAP user not found or not unique: ${username}` });
        return null;
      }

      const ldapUser = searchEntries[0] as Entry;
      await client.bind(ldapUser.dn, password);

      logger.info({ service: "auth", message: `LDAP authentication successful for: ${username}` });

      const firstName = (ldapUser.givenName as string) ?? username;
      const lastName = (ldapUser.sn as string) ?? "Unknown";
      const email = (ldapUser.mail as string) ?? `${username}@example.com`;

      return this.finalizeLogin(event, { email, firstName, lastName }, "ldap");
    } catch (error: any) {
      logger.info({ service: "auth", message: `LDAP auth failed for ${username}: ${error.message}` });
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
        ],
      });

      if (searchEntries.length !== 1) {
        logger.info({ service: "auth", message: `AD user not found or not unique: ${username}` });
        return null;
      }

      const adUser = searchEntries[0] as Entry;

      // Check disabled account flag (bit 1 of userAccountControl)
      const uac = parseInt(adUser.userAccountControl as string, 10);
      if (!isNaN(uac) && uac & UAC_ACCOUNT_DISABLED) {
        logger.info({ service: "auth", message: `AD login rejected -- account disabled: ${username}` });
        return null;
      }

      await client.bind(adUser.dn, password);

      logger.info({ service: "auth", message: `AD authentication successful for: ${username}` });

      const profile = this.extractADProfile(adUser, username, baseDn);
      return this.finalizeLogin(event, profile, "ldap");
    } catch (error: any) {
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
    // First name - givenName, then first word of displayName, then username
    const firstName =
      (adUser.givenName as string) ||
      (adUser.displayName as string)?.split(" ")[0] ||
      username;

    // Last name - sn, then remaining words of displayName
    const lastName =
      (adUser.sn as string) ||
      (adUser.displayName as string)?.split(" ").slice(1).join(" ") ||
      "Unknown";

    // Email - mail attribute then userPrincipalName (often an email?) then derive from baseDn
    let email = (adUser.mail as string) || (adUser.userPrincipalName as string);
    if (!email || !email.includes("@")) {
      const domain = domainFromBaseDn(baseDn);
      const sam = (adUser.sAMAccountName as string) || username;
      email = domain ? `${sam}@${domain}` : `${sam}@example.com`;
    }

    return { email, firstName, lastName };
  }

  async validateToken(_token: string): Promise<any> {
    return null;
  }
}

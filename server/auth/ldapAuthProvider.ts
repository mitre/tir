import { Client, SearchEntry } from "ldapts";
import { H3Event, H3Error } from "h3";
import { AuthProvider } from "./authProvider";
import { SessionService } from "./sessionService";
import { User } from "~/db/models/user";

const sessionService = new SessionService();

export class LDAPAuthProvider extends AuthProvider {
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;
  }

  async init(): Promise<void> {}

  async authenticate(event: H3Event, credentials: any): Promise<any> {
    const { username, password } = credentials;
    const { ldapUrl, ldapBindDn, ldapPassword, ldapBaseDn } = this.config;

    if (!ldapUrl || !ldapBindDn || !ldapPassword || !ldapBaseDn) {
      throw new H3Error("LDAP configuration is incomplete.");
    }

    const client = new Client({ url: ldapUrl });

    try {
      await client.bind(ldapBindDn, ldapPassword);

      const { searchEntries } = await client.search(ldapBaseDn, {
        scope: "sub",
        filter: `(uid=${username})`,
        attributes: ["dn", "cn", "sn", "givenName", "mail"],
      });

      if (searchEntries.length !== 1) {
        logger.info({ service: "Auth", message: `LDAP user not found or not unique: ${username}` });
        return null;
      }

      const ldapUser = searchEntries[0] as SearchEntry;

      await client.bind(ldapUser.dn, password);
      logger.info({
        service: "Auth",
        message: `LDAP authentication successful for user: ${username}`,
      });

      const firstName = (ldapUser.givenName as string) ?? username;
      const lastName = (ldapUser.sn as string) ?? "Unknown";
      const email = (ldapUser.mail as string) ?? `${username}@example.com`;

      let user = await User.findOne({ where: { email } });

      if (!user) {
        user = await User.create({
          firstName,
          lastName,
          email,
          UserRoleId: 2,
          TimezoneId: 1,
          creationMethod: "ldap",
          password: null,
          salt: null,
        });

        logger.info({
          service: "Auth",
          message: `Created new local user for LDAP user: ${username}`,
        });
      }

      const sessionId = await sessionService.createSession(user.id, event, {
        authMethod: "ldap",
        ipAddress: event.req.headers["x-forwarded-for"] || event.req.socket.remoteAddress,
        userAgent: event.req.headers["user-agent"],
      });

      return { id: user.id, username, dn: ldapUser.dn, sessionId };
    } catch (error: any) {
      logger.info({
        service: "Auth",
        message: `LDAP authentication failed for user: ${username}, Error: ${error.message}`,
      });
      return null;
    } finally {
      await client.unbind();
    }
  }

  async validateToken(token: string): Promise<any> {
    logger.info({
      service: "Auth",
      message: `LDAP validateToken not implemented for token: ${token}`,
    });
    return null;
  }
}

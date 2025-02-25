import { H3Event } from "h3";
import { Client, SearchEntry } from "ldapts";
import { AuthProvider } from "./authProvider";
import { SessionService } from "./sessionService";
import { User } from "~/db/models/user";

const sessionService = new SessionService();

export class LDAPAuthProvider extends AuthProvider {
  private client: Client;
  private url = "ldap://localhost:10389";
  private bindDN = "cn=admin,dc=planetexpress,dc=com";
  private bindPassword = "GoodNewsEveryone";
  private baseDN = "ou=people,dc=planetexpress,dc=com";
  // TODO: Move to ENV Vars or Config

  constructor() {
    super();
    this.client = new Client({ url: this.url });
  }

  async authenticate(event: H3Event, credentials: any): Promise<any> {
    const { username, password } = credentials;

    try {
      console.log(`Attempting to bind as admin: ${this.bindDN}`);

      await this.client.bind(this.bindDN, this.bindPassword);

      const searchOptions = {
        scope: "sub" as const,
        filter: `(uid=${username})`,
        attributes: ["cn", "sn", "givenName", "mail"],
      };

      const search = await this.client.search(this.baseDN, searchOptions);

      if (search.searchEntries.length !== 1) {
        logger.info({ service: "Auth", message: `LDAP user not found or not unique: ${username}` });
        return null;
      }

      const ldapUser = search.searchEntries[0] as SearchEntry;
      const userDN = ldapUser.dn;

      await this.client.bind(userDN, password);
      logger.info({
        service: "Auth",
        message: `LDAP authentication successful for user: ${username}`,
      });

      // TODO: Verify attributes consistent across LDAP implemenations (e.g. AD)
      const firstName = (ldapUser.givenName as string) ?? username;
      const lastName = (ldapUser.sn as string) ?? "Unknown";

      // Use the LDAP mail attribute if available, fallback to generated email for testing
      // TODO: Remove generated email
      const email = (ldapUser.mail as string) ?? `${username}@planetexpress.com`;

      let user = await User.findOne({ where: { email } });

      if (!user) {
        user = await User.create({
          firstName,
          lastName,
          email,
          UserRoleId: 1,
          TimezoneId: 1,
          creationMethod: "ldap",
          password: null, // No local password for LDAP users
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

      return { id: user.id, username, dn: userDN, sessionId };
    } catch (error) {
      logger.info({
        service: "Auth",
        message: `LDAP authentication failed for user: ${username}, Error: ${error}`,
      });
      return null;
    } finally {
      await this.client.unbind();
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

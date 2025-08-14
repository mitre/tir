import { H3Event } from "h3";

export abstract class AuthProvider {
  abstract authenticate(event: H3Event, credentials: any): Promise<any>;
  abstract validateToken(token: string): Promise<any>; // TODO: Still needed in design?
}

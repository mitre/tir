import type { AuthEvent } from "~/types/auth";

export abstract class AuthProvider {
  abstract init(): Promise<void>;
  abstract authenticate(event: AuthEvent, credentials?: any): Promise<any>;
  handleCallback?(event: AuthEvent): Promise<any>;
  validateToken?(token: string): Promise<any>;
}

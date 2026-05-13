import { deleteCookie } from "h3";
import type { H3Event } from "h3";

export const AUTH_COOKIES = {
  STATE: "pkce_state",
  NONCE: "oidc_nonce",
  CODE_VERIFIER: "oidc_code_verifier",
} as const;

export function clearAuthCookie(event: H3Event, name: string) {
  deleteCookie(event, name, { path: "/" });
}

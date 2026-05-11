import { getRawConfigValue } from "~/server/utils/config/tirConfig";

const PROBE_TIMEOUT_MS = 8_000;

interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
}

async function fetchJson(url: string): Promise<{ ok: boolean; data?: any; message: string }> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "TIR-Auth-Test" },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, data, message: `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, message: err.message ?? "Unreachable" };
  }
}

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const { id, url, clientId, secret: providedSecret, callback } = await readBody(event);

  if (!url) {
    return { ok: false, checks: [{ name: "Discovery", ok: false, message: "URL is required" }] };
  }

  let secret: string | undefined = providedSecret;
  if (!secret && id) {
    const stored = await getRawConfigValue(`auth:oidc:${id}:secret`);
    if (stored) secret = stored;
  }

  const checks: CheckResult[] = [];
  const base = url.replace(/\/$/, "");

  const discoveryUrl = `${base}/.well-known/openid-configuration`;
  const discovery = await fetchJson(discoveryUrl);

  if (!discovery.ok) {
    const direct = await fetchJson(base);
    if (direct.ok && direct.data?.authorization_endpoint) {
      checks.push({ name: "Discovery", ok: true, message: `Found at ${base}` });
      Object.assign(discovery, direct);
    } else {
      checks.push({
        name: "Discovery",
        ok: false,
        message: `${discovery.message} — is this a valid OIDC issuer URL?`,
      });
      return { ok: false, checks };
    }
  } else {
    const issuerNote = discovery.data?.issuer ? ` (issuer: ${discovery.data.issuer})` : "";
    checks.push({ name: "Discovery", ok: true, message: `Valid OIDC metadata found${issuerNote}` });
  }

  const meta = discovery.data;

  if (meta?.jwks_uri) {
    const jwks = await fetchJson(meta.jwks_uri);
    const keyCount = jwks.data?.keys?.length ?? 0;
    checks.push({
      name: "JWKS",
      ok: jwks.ok && keyCount > 0,
      message: jwks.ok ? `${keyCount} signing key${keyCount !== 1 ? "s" : ""} found` : jwks.message,
    });
  } else {
    checks.push({ name: "JWKS", ok: false, message: "jwks_uri missing from discovery document" });
  }

  if (clientId && secret && meta?.token_endpoint) {
    try {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: secret,
        code: "tir-connectivity-test",
        redirect_uri: callback || "https://localhost/callback",
      });

      const res = await fetch(meta.token_endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "TIR-Auth-Test",
        },
        body: body.toString(),
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      });

      const data = await res.json().catch(() => ({}));
      const error = data?.error;

      if (error === "invalid_grant") {
        checks.push({ name: "Client credentials", ok: true, message: "Client ID and secret accepted" });
      } else if (error === "invalid_client") {
        checks.push({ name: "Client credentials", ok: false, message: "Invalid client ID or secret" });
      } else if (error === "unauthorized_client") {
        checks.push({ name: "Client credentials", ok: false, message: "Client is not authorized for this grant type" });
      } else if (error) {
        checks.push({
          name: "Client credentials",
          ok: false,
          message: `Ambiguous response (${error}) — try Test Login to verify`,
        });
      } else {
        checks.push({ name: "Client credentials", ok: false, message: `Unexpected response: HTTP ${res.status}` });
      }
    } catch (err: any) {
      checks.push({ name: "Client credentials", ok: false, message: err.message ?? "Request failed" });
    }
  } else if (!clientId || !secret) {
    checks.push({
      name: "Client credentials",
      ok: false,
      message: !clientId ? "Client ID not configured" : "No secret available — enter a secret to test credentials",
    });
  } else {
    checks.push({ name: "Client credentials", ok: false, message: "Token endpoint missing from discovery document" });
  }

  return { ok: checks.every((c) => c.ok), checks };
});

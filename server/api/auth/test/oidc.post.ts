import https from "node:https";
import http from "node:http";
import { getRawConfigValue } from "~/server/utils/config/tirConfig";

const PROBE_TIMEOUT_MS = 8_000;

interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
}

function httpJson(
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string; rejectUnauthorized?: boolean },
): Promise<{ ok: boolean; status: number; data?: any; message: string }> {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const lib: typeof https = isHttps ? https : (http as any);

    const agent = isHttps
      ? new https.Agent({ rejectUnauthorized: options.rejectUnauthorized ?? true })
      : undefined;

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? "443" : "80"),
        path: (parsed.pathname || "/") + parsed.search,
        method: options.method ?? "GET",
        headers: options.headers ?? { Accept: "application/json", "User-Agent": "TIR-Auth-Test" },
        agent,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          clearTimeout(timer);
          const status = res.statusCode ?? 0;
          let data: any;
          try { data = JSON.parse(body); } catch { /* non-JSON */ }
          if (status < 200 || status >= 300) {
            const detail = data?.error_description || data?.error || data?.message;
            resolve({ ok: false, status, data, message: detail ? `HTTP ${status} -- ${detail}` : `HTTP ${status}` });
          } else {
            resolve({ ok: true, status, data, message: `HTTP ${status}` });
          }
        });
      },
    );

    const timer = setTimeout(() => { req.destroy(); resolve({ ok: false, status: 0, message: "Request timed out" }); }, PROBE_TIMEOUT_MS);

    req.on("error", (err: any) => {
      clearTimeout(timer);
      resolve({ ok: false, status: 0, message: err.message ?? "Connection failed" });
    });

    if (options.body) req.write(options.body);
    req.end();
  });
}

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const { id, url, clientId, secret: providedSecret, callback, sslInsecure } = await readBody(event);

  if (!url) {
    return { ok: false, checks: [{ name: "Discovery", ok: false, message: "URL is required" }] };
  }

  let secret: string | undefined = providedSecret;
  if (!secret && id) {
    const stored = await getRawConfigValue(`auth:oidc:${id}:secret`);
    if (stored) secret = stored;
  }

  const rejectUnauthorized = !sslInsecure;
  const checks: CheckResult[] = [];
  const base = url.replace(/\/$/, "");

  const discoveryUrl = `${base}/.well-known/openid-configuration`;
  const discovery = await httpJson(discoveryUrl, { rejectUnauthorized });

  if (discovery.ok) {
    const issuerNote = discovery.data?.issuer ? ` (issuer: ${discovery.data.issuer})` : "";
    const certNote = sslInsecure ? " (SSL verification disabled)" : "";
    checks.push({ name: "Discovery", ok: true, message: `Valid OIDC metadata found${issuerNote}${certNote}` });
  } else {
    const direct = await httpJson(base, { rejectUnauthorized });
    if (direct.ok && direct.data?.authorization_endpoint) {
      checks.push({ name: "Discovery", ok: true, message: `Found at ${base}` });
      Object.assign(discovery, direct);
    } else {
      checks.push({
        name: "Discovery",
        ok: false,
        message: `${discovery.message} -- is this a valid OIDC issuer URL?`,
      });
      return { ok: false, checks };
    }
  }

  const meta = discovery.data;

  if (meta?.jwks_uri) {
    const jwks = await httpJson(meta.jwks_uri, { rejectUnauthorized });
    const keyCount = jwks.data?.keys?.length ?? 0;
    const keyPlural = keyCount === 1 ? "" : "s";
    checks.push({
      name: "JWKS",
      ok: jwks.ok && keyCount > 0,
      message: jwks.ok ? `${keyCount} signing key${keyPlural} found` : jwks.message,
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

      const res = await httpJson(meta.token_endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "TIR-Auth-Test",
        },
        body: body.toString(),
        rejectUnauthorized,
      });

      const error = res.data?.error;

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
          message: `Ambiguous response (${error}) -- try Test Login to verify`,
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
      message: clientId ? "No secret available -- enter a secret to test credentials" : "Client ID not configured",
    });
  } else {
    checks.push({ name: "Client credentials", ok: false, message: "Token endpoint missing from discovery document" });
  }

  return { ok: checks.every((c) => c.ok), checks };
});

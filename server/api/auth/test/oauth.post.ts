import { H3Error } from "h3";
import type { OAuthProviderConfig } from "~/types/auth";
import { KNOWN_PROVIDERS } from "~/server/auth/oauthAuthProvider";

const PROBE_TIMEOUT_MS = 8_000;

interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
}

async function probe(label: string, url: string): Promise<CheckResult> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "TIR-Auth-Test" },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return { name: label, ok: true, message: res.ok ? `HTTP ${res.status}` : "Reachable" };
  } catch (err: any) {
    return { name: label, ok: false, message: err.message ?? "Unreachable" };
  }
}

async function probeGet(label: string, url: string): Promise<CheckResult> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TIR-Auth-Test", Accept: "application/json" },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return { name: label, ok: res.ok, message: `HTTP ${res.status}` };
  } catch (err: any) {
    return { name: label, ok: false, message: err.message ?? "Unreachable" };
  }
}

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const body = (await readBody(event)) as Partial<OAuthProviderConfig>;
  const { providerType, baseUrl, authorizationUrl, tokenUrl, userInfoUrl } = body;

  const checks: CheckResult[] = [];
  const base = (baseUrl || "").replace(/\/$/, "");

  if (providerType === "github" || providerType === "gitlab" || providerType === "bitbucket") {
    const p = KNOWN_PROVIDERS[providerType];
    checks.push(await probeGet(`${providerType} API`, p.health(base)));
    checks.push(await probe(`${providerType} OAuth endpoint`, p.authorize(base)));
  } else if (providerType === "custom") {
    if (authorizationUrl) checks.push(await probe("Authorization URL", authorizationUrl));
    else checks.push({ name: "Authorization URL", ok: false, message: "Not configured" });

    if (tokenUrl) checks.push(await probe("Token URL", tokenUrl));
    else checks.push({ name: "Token URL", ok: false, message: "Not configured" });

    if (userInfoUrl) checks.push(await probe("User Info URL", userInfoUrl));
    else checks.push({ name: "User Info URL", ok: false, message: "Not configured" });
  } else {
    throw new H3Error(`Unknown provider type: ${providerType}`);
  }

  return { ok: checks.every((c) => c.ok), checks };
});

import * as fs from "node:fs";
import * as path from "node:path";

export function loadDotEnv() {
  const envFile = path.resolve(".env");
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
}

export function dbDebugEnabled() {
  return process.env.DB_DEBUG?.toLowerCase() === "true";
}

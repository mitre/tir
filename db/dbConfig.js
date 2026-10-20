const DEFAULT_SQLITE_STORAGE = "data/tirdb.sqlite";

/**
 * @typedef {Object} SqliteDbConfig
 * @property {"sqlite"} dialect
 * @property {string} storage
 */

/**
 * @typedef {Object} PostgresDbConfig
 * @property {"postgres"} dialect
 * @property {string} host
 * @property {number} port
 * @property {string} username
 * @property {string} password
 * @property {string} database
 */

/** @typedef {SqliteDbConfig | PostgresDbConfig} DbConfig */

/**
 * Parse DATABASE_URL into a DbConfig.
 * Supports only sqlite: and postgres: URLs.
 *
 * @param {string} urlStr
 * @param {number} fallbackPort
 * @returns {DbConfig}
 */
export function parseDbUrl(urlStr, fallbackPort) {
  const protocol = urlStr.split(":")[0]; 

  switch (protocol) {
    case "sqlite": {
      const rest = urlStr.slice("sqlite:".length);

      if (rest === ":memory:" || rest === "memory:") {
        return { dialect: "sqlite", storage: ":memory:" };
      }

      if (!rest) {
        return { dialect: "sqlite", storage: DEFAULT_SQLITE_STORAGE };
      }

      return { dialect: "sqlite", storage: rest };
    }

    case "postgres": {
      const url = new URL(urlStr);

      return {
        dialect: "postgres",
        host: url.hostname,
        port: url.port ? Number.parseInt(url.port, 10) : fallbackPort,
        username: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
      };
    }

    default:
      throw new Error(`Unsupported DATABASE_URL protocol: ${protocol}`);
  }
}

/**
 * Build DbConfig from an env object.
 * Works with both process.env and Nuxt runtimeConfig mapped into this shape.
 *
 * Expected keys (all optional):
 *  - SQLITE ("true"/"false")
 *  - DATABASE_URL
 *  - DATABASE_NAME
 *  - DATABASE_USER
 *  - DATABASE_PASSWORD
 *  - DATABASE_HOST
 *  - DATABASE_PORT
 *
 * @param {Record<string, string | undefined>} env
 * @returns {DbConfig}
 */
export function buildDbConfigFromEnv(env) {
  const parsedPort = Number.parseInt(env.DATABASE_PORT || "", 10);
  const defaultPort = Number.isNaN(parsedPort) ? 5432 : parsedPort;

  const useSqlite = (env.SQLITE || env.USE_SQLITE || "").toLowerCase() === "true";
  const databaseUrl = env.DATABASE_URL;

  if (useSqlite) {
    if (databaseUrl) {
      const dbConfig = parseDbUrl(databaseUrl, defaultPort);
      if (dbConfig.dialect !== "sqlite") {
        throw new Error("SQLITE is true but DATABASE_URL is not sqlite:");
      }
      return dbConfig;
    }

    return { dialect: "sqlite", storage: DEFAULT_SQLITE_STORAGE };
  }

  if (databaseUrl) {
    const dbConfig = parseDbUrl(databaseUrl, defaultPort);
    if (dbConfig.dialect !== "postgres") {
      throw new Error("SQLITE is false but DATABASE_URL is not postgres:");
    }
    return dbConfig;
  }

  return {
    dialect: "postgres",
    host: env.DATABASE_HOST || "localhost",
    port: defaultPort,
    username: env.DATABASE_USER || "",
    password: env.DATABASE_PASSWORD || "",
    database: env.DATABASE_NAME || "",
  };
}

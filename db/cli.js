import * as fs from "node:fs";
import * as path from "node:path";
import { Sequelize } from "sequelize";
import { buildDbConfigFromEnv } from "./dbConfig.js";
import { createMigrator, createSeeder, normalizeMetaTableNames } from "./umzug.js";

const envFile = path.resolve(".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const dbConfig = buildDbConfigFromEnv(process.env);

const sequelize =
  dbConfig.dialect === "sqlite"
    ? new Sequelize({
        dialect: "sqlite",
        storage: dbConfig.storage,
        logging: console.log,
      })
    : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
        host: dbConfig.host,
        port: dbConfig.port,
        logging: console.log,
      });

await normalizeMetaTableNames(sequelize);

const logger = process.env.DB_DEBUG?.toLowerCase() === "true" ? console : undefined;

export const migrator = createMigrator(sequelize, { logger });
export const seeder = createSeeder(sequelize, { logger });

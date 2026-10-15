import { buildDbConfigFromEnv } from "./dbConfig.js";
import { createSequelize } from "./createSequelize.js";
import { dbDebugEnabled, loadDotEnv } from "./env.js";
import { createMigrator, createSeeder, normalizeMetaTableNames } from "./umzug.js";

loadDotEnv();

const sequelize = createSequelize(buildDbConfigFromEnv(process.env), { logging: console.log });

await normalizeMetaTableNames(sequelize);

const logger = dbDebugEnabled() ? console : undefined;

export const migrator = createMigrator(sequelize, { logger });
export const seeder = createSeeder(sequelize, { logger });

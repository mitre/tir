import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";
import { DateTime } from "luxon";
import { Umzug, SequelizeStorage } from "umzug";
import { buildDbConfigFromEnv } from "./dbConfig.js";

const envPath = path.resolve(".env");
dotenv.config({ path: envPath });

const processName = path.basename(process.argv[1]);
const urlName = path.basename(fileURLToPath(import.meta.url));
const debugEnabled = process.env.DB_DEBUG?.toLowerCase() === "true";

const runningUmzugCmdLine = ["migrate.js", "seed.js"].includes(processName);
const runningDevMode = ["index.mjs"].includes(processName);
const runningProduction = urlName === "/_entry.js";

let loggingFlag;

if (runningUmzugCmdLine) loggingFlag = true;
if (runningDevMode) loggingFlag = debugEnabled;
if (runningProduction) loggingFlag = debugEnabled;

const logging = loggingFlag ? console.log : false;

const dbConfig = buildDbConfigFromEnv(process.env);

const sequelize = (() => {
  if (dbConfig.dialect === "sqlite") {
    return new Sequelize({
      dialect: "sqlite",
      storage: dbConfig.storage,
      logging,
    });
  } else {
    return new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      dialect: "postgres",
      host: dbConfig.host,
      port: dbConfig.port,
      logging,
    });
  }
})();

export { sequelize };

function globalBeforeBulkCreateHook(instances) {
  instances.forEach((instance) => {
    instance.dataValues.creationDate = DateTime.now().toISO();
    instance.dataValues.lastUpdate = DateTime.now().toISO();
  });
}

sequelize.addHook("beforeCreate", (model) => {
  model.dataValues.creationDate = DateTime.now().toISO();
  model.dataValues.lastUpdate = DateTime.now().toISO();
});
sequelize.addHook("beforeUpdate", (model) => {
  model.dataValues.lastUpdate = DateTime.now().toISO();
});
sequelize.addHook("beforeBulkCreate", "bulkTimeStampHook", globalBeforeBulkCreateHook);

const logger = process.env.DB_DEBUG?.toLowerCase() === "true" ? console : undefined;

const tables = ["SequelizeMeta", "seeder_meta"];

for (const tableName of tables) {
  try {
    await sequelize.query(`
      UPDATE "${tableName}"
      SET "name" = REPLACE("name", '.ts', '.js')
      WHERE "name" LIKE '%.ts';
    `);
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      const dialect = sequelize.getDialect();
      if (
        (dialect === "sqlite" &&
          error.original?.code === "SQLITE_ERROR" &&
          error.message.includes("no such table")) ||
        (dialect === "postgres" && error.original?.code === "42P01")
      ) {
        console.log(`${tableName} table does not exist. Skipping normalization.`);
      }
    } else {
      throw error;
    }
  }
}

export const migrator = new Umzug({
  migrations: {
    glob: ["db/migrations/*.js"],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger,
  create: {
    folder: path.resolve(process.cwd(), "db/migrations"),
    template: (filepath) => {
      const templatePath = path.resolve(process.cwd(), "db/templates/sample-migration.js");
      return [[filepath, fs.readFileSync(templatePath).toString()]];
    },
  },
});

export const seeder = new Umzug({
  migrations: {
    glob: ["db/seeders/*.js"],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    modelName: "seeder_meta",
  }),
  logger,
  create: {
    folder: "db/seeders",
    template: (filepath) => [
      [
        filepath,
        fs.readFileSync(path.join(process.cwd(), "db/templates/sample-seeder.js")).toString(),
      ],
    ],
  },
});

export const DATETIME_LENGTH = 29;

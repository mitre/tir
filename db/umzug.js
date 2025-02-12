import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";
import { DateTime } from "luxon";
import { Umzug, SequelizeStorage } from "umzug";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const sqliteConnectionObject = {
  dialect: "sqlite",
  storage: "db/tirdb.sqlite",
};

const postgresConnectionObject = {
  dialect: "postgres",
  database: process.env.DATABASE_NAME || "",
  username: process.env.DATABASE_USER || "",
  password: process.env.DATABASE_PASSWORD || "",
  host: process.env.DATABASE_HOST || "",
  port: 5432, // config.database_port,
  // logging: msg => databaseLogger.info(msg),
};
const useSQLite = process.env.SQLITE === "true";
const connectionObject = useSQLite ? sqliteConnectionObject : postgresConnectionObject;
export const sequelize = new Sequelize(connectionObject);
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

const migrationsPath = ".output-db/db/migrations/*.js";

const loggerConfig = {
  info: (message) => logger.info(message),
  warn: (message) => logger.warn(message),
  error: (message) => logger.error(message),
};

export const migrator = new Umzug({
  migrations: {
    glob: ["db/migrations/*.js"],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger: console,
  create: {
    folder: path.resolve(process.cwd(), "db/migrations"),
    template: (filepath) => {
      const templatePath = path.resolve(process.cwd(), "templates/sample-migration.ts");
      return [[filepath, fs.readFileSync(templatePath).toString()]];
    },
  },
});

try {
  await sequelize.query(`
  UPDATE "SequelizeMeta"
  SET "name" = REPLACE("name", '.ts', '.js')
  WHERE "name" LIKE '%.ts';
`);
  await sequelize.query(`
  UPDATE "seeder_meta"
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
      // Handle "table does not exist" error (PostgreSQL error code 42P01)
      console.log("SequelizeMeta table does not exist. Skipping normalization.");
    }
  } else {
    throw error;
  }
}
export const seeder = new Umzug({
  migrations: {
    glob: ["db/seeders/*.js"],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    modelName: "seeder_meta",
  }),
  logger: console,
  create: {
    folder: "db/seeders",
    template: (filepath) => [
      [filepath, fs.readFileSync(path.join(__dirname, "templates/sample-seeder.ts")).toString()],
    ],
  },
});

export const DATETIME_LENGTH = 29;

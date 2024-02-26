import * as fs from "fs";
import * as path from "path";
import { type Options, Sequelize, Model } from "sequelize";
import * as dotenv from "dotenv";
import { DateTime } from "luxon";
import { Umzug, SequelizeStorage } from "../node_modules/umzug/lib/index";
import * as CONSTANTS from "../server/utils/constants";

dotenv.config();

const sqliteConnectionObject: Options = {
  dialect: "sqlite",
  storage: "db/tirdb.sqlite",
};

const postgresConnectionObject: Options = {
  dialect: "postgres",
  database: process.env.DATABASE_NAME || "",
  username: process.env.DATABASE_USER || "",
  password: process.env.DATABASE_PASSWORD || "",
  host: process.env.DATABASE_HOST || "",
  port: 5432, // config.database_port,
  // logging: msg => databaseLogger.info(msg),
};

const useSQLite: boolean = process.env.SQLITE === "true";

const connectionObject: Options = useSQLite ? sqliteConnectionObject : postgresConnectionObject;

export const sequelize = new Sequelize(connectionObject as Options);

function globalBeforeBulkCreateHook(instances: Model<any, any>[]) {
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

export const migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.ts", { cwd: __dirname }],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger: console,
  create: {
    folder: "db/migrations",
    template: (filepath: string) => [
      [filepath, fs.readFileSync(path.join(__dirname, "templates/sample-migration.ts")).toString()],
    ],
  },
});

export type Migration = typeof migrator._types.migration;

export const seeder = new Umzug({
  migrations: {
    glob: ["seeders/*.ts", { cwd: __dirname }],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    modelName: "seeder_meta",
  }),
  logger: console,
  create: {
    folder: "db/seeders",
    template: (filepath: string) => [
      [filepath, fs.readFileSync(path.join(__dirname, "templates/sample-seeder.ts")).toString()],
    ],
  },
});

export type Seeder = typeof seeder._types.migration;
export const DATETIME_LENGTH = CONSTANTS.DATETIME_LENGTH;

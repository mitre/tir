import * as fs from "node:fs";
import * as path from "node:path";
import { DataTypes } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";

const META_TABLES = ["SequelizeMeta", "seeder_meta"];

function isMissingTableError(sequelize, error) {
  if (error.name !== "SequelizeDatabaseError") return false;
  const dialect = sequelize.getDialect();
  if (dialect === "sqlite") {
    return error.original?.code === "SQLITE_ERROR" && error.message.includes("no such table");
  }
  return dialect === "postgres" && error.original?.code === "42P01";
}

// Older installs recorded migrations and seeders under their former .ts names.
export async function normalizeMetaTableNames(sequelize) {
  for (const tableName of META_TABLES) {
    try {
      await sequelize.query(`
        UPDATE "${tableName}"
        SET "name" = REPLACE("name", '.ts', '.js')
        WHERE "name" LIKE '%.ts';
      `);
    } catch (error) {
      if (!isMissingTableError(sequelize, error)) throw error;
    }
  }
}

function metaModel(sequelize, tableName) {
  return sequelize.define(
    tableName,
    {
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: false,
      },
    },
    { tableName, timestamps: false, noIsoTimestamps: true },
  );
}

function templateFrom(fileName) {
  return (filepath) => [
    [filepath, fs.readFileSync(path.resolve(process.cwd(), "db/templates", fileName)).toString()],
  ];
}

export function createMigrator(sequelize, { logger } = {}) {
  return new Umzug({
    migrations: {
      glob: ["db/migrations/*.js"],
    },
    context: sequelize,
    storage: new SequelizeStorage({ model: metaModel(sequelize, "SequelizeMeta") }),
    logger,
    create: {
      folder: path.resolve(process.cwd(), "db/migrations"),
      template: templateFrom("sample-migration.js"),
    },
  });
}

export function createSeeder(sequelize, { logger } = {}) {
  return new Umzug({
    migrations: {
      glob: ["db/seeders/*.js"],
    },
    context: sequelize,
    storage: new SequelizeStorage({ model: metaModel(sequelize, "seeder_meta") }),
    logger,
    create: {
      folder: path.resolve(process.cwd(), "db/seeders"),
      template: templateFrom("sample-seeder.js"),
    },
  });
}

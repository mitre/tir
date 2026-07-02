import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";

// Drop the UNIQUE constraint on StigLibraries.filename so it can hold the real
// uploaded filename (which may repeat, e.g. "STIG_Library.zip"); collisions are
// enforced in code (classification + libraryDate) plus the hash UNIQUE. Also
// drop the VARCHAR length limits (TEXT) - Postgres gains nothing from them and
// SQLite never enforced them.
const PG_TEXT_COLUMNS = [
  { name: "filename", allowNull: false },
  { name: "hash", allowNull: false },
  { name: "libraryDate", allowNull: true },
  { name: "importedDate", allowNull: true },
  { name: "lastUpdate", allowNull: false },
  { name: "creationDate", allowNull: false },
];

export const up = async () => {
  if (sequelize.getDialect() === "sqlite") {
    await sequelize.query(
      "CREATE TABLE 'StigLibraries_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'filename' TEXT NOT NULL, 'hash' TEXT NOT NULL UNIQUE, 'classification' TEXT, 'libraryDate' TEXT, 'version' SMALLINT, 'importedDate' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);",
    );
    await sequelize.query(
      "INSERT INTO `StigLibraries_backup` SELECT `id`, `filename`, `hash`, `classification`, `libraryDate`, `version`, `importedDate`, `lastUpdate`, `creationDate` FROM `StigLibraries`;",
    );
    await sequelize.query("DROP TABLE `StigLibraries`;");
    await sequelize.query(
      "CREATE TABLE 'StigLibraries' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'filename' TEXT NOT NULL, 'hash' TEXT NOT NULL UNIQUE, 'classification' TEXT, 'libraryDate' TEXT, 'version' SMALLINT, 'importedDate' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);",
    );
    await sequelize.query(
      "INSERT INTO `StigLibraries` SELECT `id`, `filename`, `hash`, `classification`, `libraryDate`, `version`, `importedDate`, `lastUpdate`, `creationDate` FROM `StigLibraries_backup`;",
    );
    await sequelize.query("DROP TABLE `StigLibraries_backup`;");
  } else {
    const qi = sequelize.getQueryInterface();
    await qi.removeConstraint("StigLibraries", "StigLibraries_filename_key");
    for (const { name, allowNull } of PG_TEXT_COLUMNS) {
      await qi.changeColumn("StigLibraries", name, { type: DataTypes.TEXT, allowNull });
    }
  }
};

export const down = async () => {
  if (sequelize.getDialect() === "sqlite") {
    await sequelize.query(
      "CREATE TABLE 'StigLibraries_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'filename' TEXT NOT NULL UNIQUE, 'hash' TEXT NOT NULL UNIQUE, 'classification' TEXT, 'libraryDate' TEXT, 'version' SMALLINT, 'importedDate' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);",
    );
    await sequelize.query(
      "INSERT INTO `StigLibraries_backup` SELECT `id`, `filename`, `hash`, `classification`, `libraryDate`, `version`, `importedDate`, `lastUpdate`, `creationDate` FROM `StigLibraries`;",
    );
    await sequelize.query("DROP TABLE `StigLibraries`;");
    await sequelize.query(
      "CREATE TABLE 'StigLibraries' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'filename' TEXT NOT NULL UNIQUE, 'hash' TEXT NOT NULL UNIQUE, 'classification' TEXT, 'libraryDate' TEXT, 'version' SMALLINT, 'importedDate' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);",
    );
    await sequelize.query(
      "INSERT INTO `StigLibraries` SELECT `id`, `filename`, `hash`, `classification`, `libraryDate`, `version`, `importedDate`, `lastUpdate`, `creationDate` FROM `StigLibraries_backup`;",
    );
    await sequelize.query("DROP TABLE `StigLibraries_backup`;");
  } else {
    await sequelize.getQueryInterface().addConstraint("StigLibraries", {
      type: "unique",
      fields: ["filename"],
      name: "StigLibraries_filename_key",
    });
  }
};

import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";

export const up = async () => {
  if (sequelize.getDialect() === "sqlite") {
    await sequelize.query(
      "CREATE TABLE 'StigLibraries_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'filename' TEXT NOT NULL, 'hash' TEXT NOT NULL UNIQUE, 'revisionLabel' TEXT, 'labelSource' TEXT NOT NULL DEFAULT 'auto', 'classification' TEXT, 'libraryDate' TEXT, 'version' SMALLINT, 'importedDate' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);",
    );
    await sequelize.query(
      "INSERT INTO `StigLibraries_backup` SELECT `id`, `filename`, `hash`, NULL, 'auto', `classification`, `libraryDate`, `version`, `importedDate`, `lastUpdate`, `creationDate` FROM `StigLibraries`;",
    );
    await sequelize.query("DROP TABLE `StigLibraries`;");
    await sequelize.query(
      "CREATE TABLE 'StigLibraries' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'filename' TEXT NOT NULL, 'hash' TEXT NOT NULL UNIQUE, 'revisionLabel' TEXT, 'labelSource' TEXT NOT NULL DEFAULT 'auto', 'classification' TEXT, 'libraryDate' TEXT, 'version' SMALLINT, 'importedDate' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);",
    );
    await sequelize.query("INSERT INTO `StigLibraries` SELECT * FROM `StigLibraries_backup`;");
    await sequelize.query("DROP TABLE `StigLibraries_backup`;");
  } else {
    const qi = sequelize.getQueryInterface();
    await qi.addColumn("StigLibraries", "revisionLabel", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await qi.addColumn("StigLibraries", "labelSource", {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "auto",
    });
  }

  // Only single-member groups: legacy same-date duplicates (possible before
  // this feature) need content ordering, which app-side recompute does on the
  // group's next change.
  await sequelize.query(`
    UPDATE "StigLibraries" SET "revisionLabel" = 'rev 1'
    WHERE "revisionLabel" IS NULL
      AND "labelSource" = 'auto'
      AND "classification" IS NOT NULL
      AND "libraryDate" IS NOT NULL
      AND (
        SELECT COUNT(*) FROM "StigLibraries" AS s2
        WHERE s2."classification" = "StigLibraries"."classification"
          AND s2."libraryDate" = "StigLibraries"."libraryDate"
      ) = 1;
  `);
};

export const down = async () => {
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
    await sequelize.query("INSERT INTO `StigLibraries` SELECT * FROM `StigLibraries_backup`;");
    await sequelize.query("DROP TABLE `StigLibraries_backup`;");
  } else {
    const qi = sequelize.getQueryInterface();
    await qi.removeColumn("StigLibraries", "revisionLabel");
    await qi.removeColumn("StigLibraries", "labelSource");
  }
};

import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("Timezones", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.STRING(64),
    abbreviation: DataTypes.STRING(5),
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addColumn("Users", "TimezoneId", {
    type: DataTypes.INTEGER,
    references: {
      model: "Timezones",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
};

export const down: MigrationFn = async () => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Users", "TimezoneId");
  } else {
    await sequelize.query(
      "CREATE TABLE `Users_backup` (`creationDate` VARCHAR(29) NOT NULL, `email` VARCHAR(255) NOT NULL UNIQUE, `firstName` VARCHAR(255) NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastName` VARCHAR(255) NOT NULL, `lastUpdate` VARCHAR(29) NOT NULL, `password` VARCHAR(128), `UserRoleId` INTEGER REFERENCES `UserRoles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Users_backup` SELECT `creationDate`, `email`, `firstname` , `id`, `lastName`, `lastUpdate`, `password`, `UserRoleId` FROM `Users`;",
    );
    await sequelize.query("DROP TABLE `Users`;");
    await sequelize.query(
      "CREATE TABLE `Users` (`creationDate` VARCHAR(29) NOT NULL, `email` VARCHAR(255) NOT NULL UNIQUE, `firstName` VARCHAR(255) NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastName` VARCHAR(255) NOT NULL, `lastUpdate` VARCHAR(29) NOT NULL, `password` VARCHAR(128), `UserRoleId` INTEGER REFERENCES `UserRoles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Users` SELECT `creationDate`, `email`, `firstname` , `id`, `lastName`, `lastUpdate`, `password`, `UserRoleId` FROM `Users_backup`;",
    );

    await sequelize.query("DROP TABLE `Users_backup`;");
  }
  await sequelize.getQueryInterface().dropTable("Timezones");
};

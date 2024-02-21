import * as dotenv from "dotenv";
import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

dotenv.config();

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("Themes", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addColumn("Users", "ThemeId", {
    type: DataTypes.INTEGER,
    references: {
      model: "Themes",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
};

export const down: MigrationFn = async () => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Users", "ThemeId");
  } else {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS 'Users_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'firstName' VARCHAR(255) NOT NULL, 'lastName' VARCHAR(255) NOT NULL, 'email' VARCHAR(255) NOT NULL UNIQUE, 'password' VARCHAR(128), 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'UserRoleId' INTEGER REFERENCES 'UserRoles' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TimezoneId' INTEGER REFERENCES 'Timezones' ('id') ON DELETE SET NULL ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Users_backup` SELECT `id`, `firstName`, `lastName`, `email`, `password`, `lastUpdate`, `creationDate`, `UserRoleId`, `TimezoneId` FROM `Users`;",
    );
    await sequelize.query("DROP TABLE `Users`;");
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS 'Users' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'firstName' VARCHAR(255) NOT NULL, 'lastName' VARCHAR(255) NOT NULL, 'email' VARCHAR(255) NOT NULL UNIQUE, 'password' VARCHAR(128), 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'UserRoleId' INTEGER REFERENCES 'UserRoles' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TimezoneId' INTEGER REFERENCES 'Timezones' ('id') ON DELETE SET NULL ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Users` SELECT `id`, `firstName`, `lastName`, `email`, `password`, `lastUpdate`, `creationDate`, `UserRoleId`, `TimezoneId` FROM `Users_backup`;",
    );
    await sequelize.query("DROP TABLE `Users_backup`;");
  }

  await sequelize.getQueryInterface().dropTable("Themes");
};

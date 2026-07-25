import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("Timezones", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.TEXT,
    abbreviation: DataTypes.TEXT,
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
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
export const down = async () => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Users", "TimezoneId");
  } else {
    await sequelize.query(
      "CREATE TABLE `Users_backup` (`creationDate` TEXT NOT NULL, `email` TEXT NOT NULL UNIQUE, `firstName` TEXT NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastName` TEXT NOT NULL, `lastUpdate` TEXT NOT NULL, `password` TEXT, `UserRoleId` INTEGER REFERENCES `UserRoles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Users_backup` SELECT `creationDate`, `email`, `firstname` , `id`, `lastName`, `lastUpdate`, `password`, `UserRoleId` FROM `Users`;",
    );
    await sequelize.query("DROP TABLE `Users`;");
    await sequelize.query(
      "CREATE TABLE `Users` (`creationDate` TEXT NOT NULL, `email` TEXT NOT NULL UNIQUE, `firstName` TEXT NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastName` TEXT NOT NULL, `lastUpdate` TEXT NOT NULL, `password` TEXT, `UserRoleId` INTEGER REFERENCES `UserRoles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Users` SELECT `creationDate`, `email`, `firstname` , `id`, `lastName`, `lastUpdate`, `password`, `UserRoleId` FROM `Users_backup`;",
    );
    await sequelize.query("DROP TABLE `Users_backup`;");
  }
  await sequelize.getQueryInterface().dropTable("Timezones");
};

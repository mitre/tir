import * as dotenv from "dotenv";
import { DataTypes } from "sequelize";

dotenv.config();
export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("Themes", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
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
export const down = async ({ context: sequelize }) => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Users", "ThemeId");
  } else {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS 'Users_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'firstName' TEXT NOT NULL, 'lastName' TEXT NOT NULL, 'email' TEXT NOT NULL UNIQUE, 'password' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL, 'UserRoleId' INTEGER REFERENCES 'UserRoles' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TimezoneId' INTEGER REFERENCES 'Timezones' ('id') ON DELETE SET NULL ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Users_backup` SELECT `id`, `firstName`, `lastName`, `email`, `password`, `lastUpdate`, `creationDate`, `UserRoleId`, `TimezoneId` FROM `Users`;",
    );
    await sequelize.query("DROP TABLE `Users`;");
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS 'Users' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'firstName' TEXT NOT NULL, 'lastName' TEXT NOT NULL, 'email' TEXT NOT NULL UNIQUE, 'password' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL, 'UserRoleId' INTEGER REFERENCES 'UserRoles' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TimezoneId' INTEGER REFERENCES 'Timezones' ('id') ON DELETE SET NULL ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Users` SELECT `id`, `firstName`, `lastName`, `email`, `password`, `lastUpdate`, `creationDate`, `UserRoleId`, `TimezoneId` FROM `Users_backup`;",
    );
    await sequelize.query("DROP TABLE `Users_backup`;");
  }
  await sequelize.getQueryInterface().dropTable("Themes");
};

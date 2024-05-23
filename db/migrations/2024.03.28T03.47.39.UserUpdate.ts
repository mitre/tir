import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  const upMigration = await sequelize.transaction();

  await sequelize.getQueryInterface().addColumn(
    "Users",
    "organization",
    {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    { transaction: upMigration },
  );

  await sequelize.getQueryInterface().addColumn(
    "Users",
    "passwordChangedAt",
    {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: true,
    },
    { transaction: upMigration },
  );

  await sequelize.getQueryInterface().addColumn(
    "Users",
    "forcePasswordChange",
    {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    { transaction: upMigration },
  );

  await sequelize.getQueryInterface().addColumn(
    "Users",
    "loginCount",
    {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    { transaction: upMigration },
  );

  await sequelize.getQueryInterface().addColumn(
    "Users",
    "lastLogin",
    {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: true,
    },
    { transaction: upMigration },
  );

  await sequelize.getQueryInterface().addColumn(
    "Users",
    "creationMethod",
    {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: "local",
    },
    { transaction: upMigration },
  );

  await sequelize.getQueryInterface().addColumn(
    "Users",
    "salt",
    {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    { transaction: upMigration },
  );

  await upMigration.commit();
};

export const down: MigrationFn = async () => {
  const downMigration = await sequelize.transaction();

  if (sequelize.getDialect() !== "sqlite") {
    await sequelize
      .getQueryInterface()
      .removeColumn("Users", "organization", { transaction: downMigration });
    await sequelize
      .getQueryInterface()
      .removeColumn("Users", "passwordChangedAt", { transaction: downMigration });
    await sequelize
      .getQueryInterface()
      .removeColumn("Users", "forcePasswordChange", { transaction: downMigration });
    await sequelize
      .getQueryInterface()
      .removeColumn("Users", "lastLogin", { transaction: downMigration });
    await sequelize
      .getQueryInterface()
      .removeColumn("Users", "creationMethod", { transaction: downMigration });
    await sequelize
      .getQueryInterface()
      .removeColumn("Users", "loginCount", { transaction: downMigration });
    await sequelize
      .getQueryInterface()
      .removeColumn("Users", "salt", { transaction: downMigration });

    await downMigration.commit();
  } else {
    await sequelize.query(
      `CREATE TABLE 'Users_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'firstName' VARCHAR(255) NOT NULL, 'lastName' VARCHAR(255) NOT NULL, 'email' VARCHAR(255) NOT NULL UNIQUE, 'password' VARCHAR(128), 'UserRoleId' INTEGER REFERENCES 'UserRoles' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'TimezoneId' INTEGER REFERENCES 'Timezones' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'ThemeId' INTEGER REFERENCES 'Themes' ('id') ON DELETE SET NULL ON UPDATE CASCADE);`,
      { transaction: downMigration },
    );
    await sequelize.query(
      "INSERT INTO `Users_backup` SELECT `id`, `firstName`, `lastName`, `email`, `password`, `UserRoleId`, `lastUpdate`, `creationDate`, `TimezoneId`, `ThemeId` FROM `Users`;",
      { transaction: downMigration },
    );
    await sequelize.query(`DROP TABLE 'Users';`, { transaction: downMigration });
    await sequelize.query(
      `CREATE TABLE 'Users' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'firstName' VARCHAR(255) NOT NULL, 'lastName' VARCHAR(255) NOT NULL, 'email' VARCHAR(255) NOT NULL UNIQUE, 'password' VARCHAR(128), 'UserRoleId' INTEGER REFERENCES 'UserRoles' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'TimezoneId' INTEGER REFERENCES 'Timezones' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'ThemeId' INTEGER REFERENCES 'Themes' ('id') ON DELETE SET NULL ON UPDATE CASCADE);`,
      { transaction: downMigration },
    );
    await sequelize.query(
      "INSERT INTO `Users` SELECT `id`, `firstName`, `lastName`, `email`, `password`, `UserRoleId`, `lastUpdate`, `creationDate`, `TimezoneId`, `ThemeId` FROM `Users_backup`;",
      { transaction: downMigration },
    );
    await sequelize.query(`DROP TABLE 'Users_backup';`, { transaction: downMigration });

    await downMigration.commit();
  }
};

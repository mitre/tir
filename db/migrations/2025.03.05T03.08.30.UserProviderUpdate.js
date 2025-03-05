import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  const upMigration = await sequelize.transaction();
  try {
    if (sequelize.getDialect() !== "sqlite") {
      await sequelize.getQueryInterface().addColumn(
        "Users",
        "providerId",
        {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        { transaction: upMigration },
      );
    } else {
      await sequelize.query(
        `CREATE TABLE "Users_backup" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT,
          "UserRoleId" INTEGER REFERENCES "UserRoles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          "lastUpdate" TEXT NOT NULL,
          "creationDate" TEXT NOT NULL,
          "TimezoneId" INTEGER REFERENCES "Timezones" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          "ThemeId" INTEGER REFERENCES "Themes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          "providerId" TEXT
        );`,
        { transaction: upMigration },
      );

      await sequelize.query(
        `INSERT INTO "Users_backup" (id, firstName, lastName, email, password, UserRoleId, lastUpdate, creationDate, TimezoneId, ThemeId, providerId)
         SELECT id, firstName, lastName, email, password, UserRoleId, lastUpdate, creationDate, TimezoneId, ThemeId, NULL FROM "Users";`,
        { transaction: upMigration },
      );

      await sequelize.query(`DROP TABLE "Users";`, { transaction: upMigration });

      await sequelize.query(`ALTER TABLE "Users_backup" RENAME TO "Users";`, {
        transaction: upMigration,
      });
    }
    await upMigration.commit();
  } catch (error) {
    await upMigration.rollback();
    throw error;
  }
};

export const down = async () => {
  const downMigration = await sequelize.transaction();
  try {
    if (sequelize.getDialect() !== "sqlite") {
      await sequelize
        .getQueryInterface()
        .removeColumn("Users", "providerId", { transaction: downMigration });
    } else {
      await sequelize.query(
        `CREATE TABLE "Users_backup" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT,
          "UserRoleId" INTEGER REFERENCES "UserRoles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          "lastUpdate" TEXT NOT NULL,
          "creationDate" TEXT NOT NULL,
          "TimezoneId" INTEGER REFERENCES "Timezones" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          "ThemeId" INTEGER REFERENCES "Themes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
        );`,
        { transaction: downMigration },
      );

      await sequelize.query(
        `INSERT INTO "Users_backup" (id, firstName, lastName, email, password, UserRoleId, lastUpdate, creationDate, TimezoneId, ThemeId)
         SELECT id, firstName, lastName, email, password, UserRoleId, lastUpdate, creationDate, TimezoneId, ThemeId FROM "Users";`,
        { transaction: downMigration },
      );

      await sequelize.query(`DROP TABLE "Users";`, { transaction: downMigration });

      await sequelize.query(`ALTER TABLE "Users_backup" RENAME TO "Users";`, {
        transaction: downMigration,
      });
    }
    await downMigration.commit();
  } catch (error) {
    await downMigration.rollback();
    throw error;
  }
};

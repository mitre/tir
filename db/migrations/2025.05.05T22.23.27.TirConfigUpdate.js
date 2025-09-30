import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  const upMigration = await sequelize.transaction();

  try {
    if (sequelize.getDialect() !== "sqlite") {
      await sequelize.getQueryInterface().changeColumn(
        "TirConfigs",
        "value",
        {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        { transaction: upMigration },
      );
    } else {
      await sequelize.query(
        `CREATE TABLE "TirConfigs_backup" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT,
          "key" TEXT NOT NULL UNIQUE,
          "value" TEXT NOT NULL,
          "lastUpdate" TEXT NOT NULL,
          "creationDate" TEXT NOT NULL
        );`,
        { transaction: upMigration },
      );

      await sequelize.query(
        `INSERT INTO "TirConfigs_backup" (id, key, value, lastUpdate, creationDate)
         SELECT id, key, value, lastUpdate, creationDate FROM "TirConfigs";`,
        { transaction: upMigration },
      );

      await sequelize.query(`DROP TABLE "TirConfigs";`, {
        transaction: upMigration,
      });

      await sequelize.query(`ALTER TABLE "TirConfigs_backup" RENAME TO "TirConfigs";`, {
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
      await sequelize.getQueryInterface().changeColumn(
        "TirConfigs",
        "value",
        {
          type: DataTypes.STRING,
          allowNull: false,
        },
        { transaction: downMigration },
      );
    } else {
      await sequelize.query(
        `CREATE TABLE "TirConfigs_backup" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT,
          "key" TEXT NOT NULL UNIQUE,
          "value" TEXT NOT NULL, 
          "lastUpdate" TEXT NOT NULL,
          "creationDate" TEXT NOT NULL
        );`,
        { transaction: downMigration },
      );

      await sequelize.query(
        `INSERT INTO "TirConfigs_backup" (id, key, value, lastUpdate, creationDate)
         SELECT id, key, value, lastUpdate, creationDate FROM "TirConfigs";`,
        { transaction: downMigration },
      );

      await sequelize.query(`DROP TABLE "TirConfigs";`, {
        transaction: downMigration,
      });

      await sequelize.query(`ALTER TABLE "TirConfigs_backup" RENAME TO "TirConfigs";`, {
        transaction: downMigration,
      });
    }

    await downMigration.commit();
  } catch (error) {
    await downMigration.rollback();
    throw error;
  }
};

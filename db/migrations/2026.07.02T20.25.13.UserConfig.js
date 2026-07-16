import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";

export const up = async () => {
  const transaction = await sequelize.transaction();

  try {
    await sequelize.getQueryInterface().createTable(
      "UserConfigs",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        UserId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ThemeId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "Themes",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        TimezoneId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "Timezones",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction },
    );

    await sequelize.getQueryInterface().createTable(
      "UserConfig_Tiers",
      {
        UserConfigId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "UserConfigs",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        TierId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Tiers",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      { transaction },
    );

    await sequelize.getQueryInterface().createTable(
      "UserConfig_Boundaries",
      {
        UserConfigId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "UserConfigs",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        BoundaryId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Boundaries",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      { transaction },
    );

    const now = new Date().toISOString();

    await sequelize.query(
      `
        INSERT INTO "UserConfigs"
          ("UserId", "ThemeId", "TimezoneId", "lastUpdate", "creationDate")
        SELECT
          "id",
          "ThemeId",
          "TimezoneId",
          :now,
          :now
        FROM "Users";
      `,
      {
        replacements: { now },
        transaction,
      },
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const down = async () => {
  const transaction = await sequelize.transaction();

  try {
    await sequelize.getQueryInterface().dropTable("UserConfig_Boundaries", {
      transaction,
    });

    await sequelize.getQueryInterface().dropTable("UserConfig_Tiers", {
      transaction,
    });

    await sequelize.getQueryInterface().dropTable("UserConfigs", {
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
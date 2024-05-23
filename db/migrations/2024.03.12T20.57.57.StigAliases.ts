import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("StigAliases", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    alias: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    identifier: {
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
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("StigAliases");
};

import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("StigIdents", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    system: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
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
  await sequelize.getQueryInterface().createTable("StigData_StigIdents", {
    StigDatumId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: "StigData", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    StigIdentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: "StigIdents", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("StigData_StigIdents");
  await sequelize.getQueryInterface().dropTable("StigIdents");
};

import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("StigIdents", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    system: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    text: {
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
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("StigData_StigIdents");
  await sequelize.getQueryInterface().dropTable("StigIdents");
};

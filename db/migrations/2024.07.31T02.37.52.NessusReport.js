import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("NessusReports", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reportHostName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    SystemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Systems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
};
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("NessusReports");
};

import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("Assessments", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    classification: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    customname: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uuid: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    SystemId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Systems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    StigId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Stigs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  });
};
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("Assessments");
};

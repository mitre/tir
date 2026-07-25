import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("StigResponsibilities", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
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
  await sequelize.getQueryInterface().createTable("StigData_StigResponsibilities", {
    StigResponsibilityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "StigResponsibilities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    StigDatumId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "StigData",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("StigResponsibilities");
  await sequelize.getQueryInterface().dropTable("StigData_StigResponsibilities");
};

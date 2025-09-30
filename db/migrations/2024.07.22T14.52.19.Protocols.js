import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("Protocols", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("Protocols");
};

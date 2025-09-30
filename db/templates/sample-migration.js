import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("TableName", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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
  await sequelize.getQueryInterface().dropTable("TableName");
};

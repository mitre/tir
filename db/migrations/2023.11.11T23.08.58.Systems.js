import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("Systems", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: true,
    },
    name: {
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
    hostname: DataTypes.TEXT,
    BoundaryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Boundaries",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("Systems");
};

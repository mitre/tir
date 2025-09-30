import { DataTypes } from "sequelize";

import { sequelize, DATETIME_LENGTH } from "../umzug.js";
export const up = async () => {
  const schemaPrefix = sequelize.getDialect() === "postgres" ? "public." : "";
  await sequelize.getQueryInterface().createTable("StigOverrides", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
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
    SystemId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Systems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    StigDatumId: {
      type: DataTypes.INTEGER,
      references: {
        model: "StigData",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
  await sequelize.query(`
    INSERT INTO ${schemaPrefix}"StigOverrides" (
      type, value, "lastUpdate", "creationDate", "SystemId", "StigDatumId"
    )
    SELECT 
      'status' AS type, 
      status AS "value", 
      "lastUpdate", 
      "creationDate", 
      "SystemId", 
      "StigDatumId"
    FROM ${schemaPrefix}"Overrides"
    `);
};
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("StigOverrides");
};

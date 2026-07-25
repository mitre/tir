import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  const schemaPrefix = sequelize.getDialect() === "postgres" ? "public." : "";
  await sequelize.getQueryInterface().createTable("StigOverrides", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    value: {
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
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("StigOverrides");
};

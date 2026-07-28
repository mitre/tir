import { DataTypes } from "sequelize";
export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("TirAliases", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    term: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    alias: {
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
};
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("TirAliases");
};

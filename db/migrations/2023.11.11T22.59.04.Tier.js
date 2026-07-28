import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("Tiers", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Tiers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    hasBoundaries: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
  await sequelize.getQueryInterface().dropTable("Tiers");
};

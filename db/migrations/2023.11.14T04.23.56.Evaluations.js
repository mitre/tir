import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("Evaluations", {
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
    BoundaryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Boundaries",
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
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("Evaluations");
};

import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("Stig_Systems", {
    StigId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Stigs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    SystemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Systems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("Stig_Systems");
};

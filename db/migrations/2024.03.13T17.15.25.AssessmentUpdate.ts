import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().addColumn("Assessments", "succeededByAssessmentId", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Assessments",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().removeColumn("Assessments", "succeededByAssessmentId");
};

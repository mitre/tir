import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
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

export const down = async () => {
  await sequelize.getQueryInterface().removeColumn("Assessments", "succeededByAssessmentId");
};

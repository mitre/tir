import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
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

export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn("Assessments", "succeededByAssessmentId");
};

import { DataTypes } from "sequelize";

import { sequelize, DATETIME_LENGTH } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().dropTable("EvaluationItem_Milestones");
};
export const down = async () => {
  await sequelize.getQueryInterface().createTable("EvaluationItem_Milestones", {
    EvaluationItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "EvaluationItems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    MilestoneId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Milestones",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};

import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("EvalDates_Users", {
    UserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
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
  });
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("EvalDates_Users");
};

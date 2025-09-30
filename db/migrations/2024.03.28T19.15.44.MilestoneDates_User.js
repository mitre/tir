import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("MilestoneDates_Users", {
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

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("MilestoneDates_Users");
};

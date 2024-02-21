import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("AssessmentItems", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["Not_Reviewed", "Open", "NotAFinding", "Not_Applicable"],
      allowNull: false,
    },
    finding_details: {
      type: DataTypes.TEXT,
    },
    comments: {
      type: DataTypes.TEXT,
    },
    severity_override: {
      type: DataTypes.ENUM,
      values: ["high", "medium", "low"],
      allowNull: true,
    },
    severity_justification: {
      type: DataTypes.STRING,
    },
    current: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    previousId: {
      type: DataTypes.INTEGER,
      references: {
        model: "AssessmentItems",
        key: "id",
      },
    },
    AssessmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Assessments",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    StigDatumId: {
      type: DataTypes.INTEGER,
      references: {
        model: "StigData",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  });
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("AssessmentItems");
};

import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("EvaluationItems", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["Not_Reviewed", "Open", "NotAFinding", "Not_Applicable", "Not_Set"],
      allowNull: false,
    },
    finding_details: {
      type: DataTypes.STRING,
    },
    comments: {
      type: DataTypes.STRING,
    },
    severity_override: {
      type: DataTypes.ENUM,
      values: ["high", "medium", "low"],
      allowNull: true,
    },
    severity_justification: {
      type: DataTypes.STRING,
    },
    Office_Org: {
      type: DataTypes.STRING(256),
    },
    Resources_Required: {
      type: DataTypes.STRING(256),
    },
    Scheduled_Completion_Date: {
      type: DataTypes.STRING(DATETIME_LENGTH),
    },
    Milestone_Changes: {
      type: DataTypes.STRING(256),
    },
    Poam_Comments: {
      type: DataTypes.STRING(1024),
    },
    Mitigations: {
      type: DataTypes.STRING(256),
    },
    Severity: {
      type: DataTypes.ENUM,
      values: ["Very High", "High", "Moderate", "Low", "Very Low"],
      allowNull: true,
    },
    Relevance_of_Threat: {
      type: DataTypes.ENUM,
      values: ["Very High", "High", "Moderate", "Low", "Very Low"],
      allowNull: true,
    },
    Likelihood: {
      type: DataTypes.ENUM,
      values: ["Very High", "High", "Moderate", "Low", "Very Low"],
      allowNull: true,
    },
    Impact: {
      type: DataTypes.ENUM,
      values: ["Very High", "High", "Moderate", "Low", "Very Low"],
      allowNull: true,
    },
    Impact_Description: {
      type: DataTypes.STRING(256),
    },
    Residual_Risk_Level: {
      type: DataTypes.ENUM,
      values: ["Very High", "High", "Moderate", "Low", "Very Low"],
      allowNull: true,
    },
    Recommendations: {
      type: DataTypes.STRING(256),
    },
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    EvaluationId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Evaluations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    StigDatumId: {
      type: DataTypes.INTEGER,
      references: {
        model: "StigData",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  });

  await sequelize.getQueryInterface().createTable("Milestones", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completion_date: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    EvaluationItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "EvaluationItems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });

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

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("Milestones");
  await sequelize.getQueryInterface().dropTable("EvaluationItems");
  await sequelize.getQueryInterface().dropTable("EvaluationItem_Milestones");
};

import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
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
      type: DataTypes.TEXT,
    },
    Office_Org: {
      type: DataTypes.TEXT,
    },
    Resources_Required: {
      type: DataTypes.TEXT,
    },
    Scheduled_Completion_Date: {
      type: DataTypes.TEXT,
    },
    Milestone_Changes: {
      type: DataTypes.TEXT,
    },
    Poam_Comments: {
      type: DataTypes.TEXT,
    },
    Mitigations: {
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
    },
    Residual_Risk_Level: {
      type: DataTypes.ENUM,
      values: ["Very High", "High", "Moderate", "Low", "Very Low"],
      allowNull: true,
    },
    Recommendations: {
      type: DataTypes.TEXT,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    completion_date: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
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
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("Milestones");
  await sequelize.getQueryInterface().dropTable("EvaluationItems");
  await sequelize.getQueryInterface().dropTable("EvaluationItem_Milestones");
};

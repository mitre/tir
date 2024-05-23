/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  type BelongsToManyAddAssociationMixin,
} from "sequelize";
import type { Milestone, User } from ".";

type levels = "Very High" | "High" | "Moderate" | "Low" | "Very Low";

// order of InferAttributes & InferCreationAttributes is important.
export class EvaluationItem extends Model<
  InferAttributes<EvaluationItem>,
  InferCreationAttributes<EvaluationItem>
> {
  declare id: CreationOptional<number>;
  declare Office_Org: string;
  declare Resources_Required: string;
  declare Scheduled_Completion_Date: string;
  declare Milestone_Changes: string;
  declare Poam_Comments: string;
  declare Mitigations: string;
  declare Severity: levels;
  declare Relevance_of_Threat: levels;
  declare Likelihood: levels;
  declare Impact: levels;
  declare Impact_Description: levels;
  declare Residual_Risk_Level: levels;
  declare Recommendations: levels;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
  declare Users?: NonAttribute<User[]>;

  declare Milestones?: NonAttribute<Milestone[]>;

  declare addUser: BelongsToManyAddAssociationMixin<User, number>;

  declare static associations: {
    Milestones: Association<EvaluationItem, Milestone>;
    Users: Association<EvaluationItem, User>;
  };
}

EvaluationItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
  },
  {
    sequelize,
    modelName: "EvaluationItem",
    timestamps: false,
  },
);

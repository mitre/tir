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
  type ForeignKey,
} from "sequelize";
import {Evaluation} from './evaluation';
import {StigData} from './stigData';
import type { Milestone, User } from ".";
import type { levels } from "~/types/evaluation";

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
  declare Severity: levels | null;
  declare Relevance_of_Threat: levels | null;
  declare Likelihood: levels | null;
  declare Impact: levels | null;
  declare Impact_Description: string;
  declare Residual_Risk_Level: levels | null;
  declare Recommendations: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
  declare Users?: NonAttribute<User[]>;

  declare Milestones?: NonAttribute<Milestone[]>;

  declare addUser: BelongsToManyAddAssociationMixin<User, number>;

  declare EvaluationId: ForeignKey<Evaluation["id"]>;
  declare StigDatumId: ForeignKey<StigData["id"]>;

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
    EvaluationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Evaluation,
        key: 'id',
      },
    },
    StigDatumId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: StigData,
        key: 'id',
      },
    },
    Office_Org: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Resources_Required: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Scheduled_Completion_Date: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Milestone_Changes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Poam_Comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Mitigations: {
      type: DataTypes.TEXT,
      allowNull: true,
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
      allowNull: true,
    },
    Residual_Risk_Level: {
      type: DataTypes.ENUM,
      values: ["Very High", "High", "Moderate", "Low", "Very Low"],
      allowNull: true,
    },
    Recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "EvaluationItem",
    timestamps: false,
  },
);

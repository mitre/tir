/* eslint-disable no-use-before-define */
import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  Association,
  type NonAttribute,
  type ForeignKey,
} from "sequelize";

import { AssessmentItem } from "./assessmentItem";
import { System } from "./system";
import { Stig } from "./stig";

export class Assessment extends Model<
  InferAttributes<Assessment>,
  InferCreationAttributes<Assessment>
> {
  declare id: CreationOptional<number>;
  declare classification: string;
  declare customname: string;
  declare uuid: string;
  declare comment: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare AssessmentItems?: NonAttribute<AssessmentItem[]>;
  declare System?: NonAttribute<System>;
  declare SystemId: ForeignKey<System["id"]>;
  declare StigId: ForeignKey<Stig["id"]>;
  declare Stig?: NonAttribute<Stig>;
  declare succeededByAssessmentId: ForeignKey<Assessment["id"]> | null;

  declare static associations: {
    AssessmentItems: Association<Assessment, AssessmentItem>;
    System: Association<Assessment, System>;
    Stig: Association<Assessment, Stig>;
  };
}

Assessment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    classification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    succeededByAssessmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Assessments",
        key: "id",
      },
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
    modelName: "Assessment",
    timestamps: false,
  },
);

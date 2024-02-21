/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Association,
  ForeignKey,
  NonAttribute,
} from "sequelize";

import { Assessment } from "./assessment";

export class AssessmentItem extends Model<
  InferAttributes<AssessmentItem>,
  InferCreationAttributes<AssessmentItem>
> {
  declare id: CreationOptional<number>;
  declare status: string;
  declare finding_details: string;
  declare comments: string;
  declare severity_override: string;
  declare severity_justification: string;
  declare current: string;
  declare previousId: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare AssessmentId: ForeignKey<Assessment["id"]>;
  declare Assessment?: NonAttribute<Assessment>;

  declare static associations: {
    Assessment: Association<Assessment, AssessmentItem>;
  };
}

AssessmentItem.init(
  {
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
    previousId: {
      type: DataTypes.INTEGER,
      references: {
        model: AssessmentItem,
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
    modelName: "AssessmentItem",
    timestamps: false,
  },
);

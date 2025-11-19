/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class ComplianceStatus extends Model<
  InferAttributes<ComplianceStatus>,
  InferCreationAttributes<ComplianceStatus>
> {
  declare id: CreationOptional<number>;
  declare status: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

ComplianceStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
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
  },
  {
    sequelize,
    modelName: "ComplianceStatus",
    timestamps: false,
  },
);
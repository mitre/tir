/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  Association,
} from "sequelize";
import { ControlEnhancementStatement } from "./controlEnhancementStatement";
import { Control } from ".";
export class ControlEnhancement extends Model<
  InferAttributes<ControlEnhancement>,
  InferCreationAttributes<ControlEnhancement>
> {
  declare id: CreationOptional<number>;
  declare ControlId: number;
  declare enhancementIdentifier: string;
  declare privacyImpact: string;
  declare title: string;
  declare guidance: string;
  declare lastUpdate: CreationOptional<number>;
  declare creationDate: CreationOptional<number>;

  declare ControlEnhancementStatements?: NonAttribute<ControlEnhancementStatement[]>;

  declare static associations: {
    Control: Association<ControlEnhancement, Control>;
    ControlEnhancementStatements: Association<ControlEnhancement, ControlEnhancementStatement>;
  };
}

ControlEnhancement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ControlId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Control",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    enhancementIdentifier: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    privacyImpact: {
      type: DataTypes.TEXT,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    guidance: {
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
    modelName: "ControlEnhancement",
    timestamps: false,
  },
);

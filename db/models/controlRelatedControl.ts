/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  Association,
} from "sequelize";
import { Control } from "./controls";

export class ControlRelatedControl extends Model<
  InferAttributes<ControlRelatedControl>,
  InferCreationAttributes<ControlRelatedControl>
> {
  declare id: CreationOptional<number>;
  declare ControlId: number;
  declare relatedControl: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    Control: Association<ControlRelatedControl, Control>;
  };
}

ControlRelatedControl.init(
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
        model: Control,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    relatedControl: {
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
    modelName: "ControlRelatedControl",
    timestamps: false,
  },
);

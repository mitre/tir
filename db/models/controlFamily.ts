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
import { Control } from "./controls";
export class ControlFamily extends Model<
  InferAttributes<ControlFamily>,
  InferCreationAttributes<ControlFamily>
> {
  declare id: CreationOptional<number>;
  declare name: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare Controls?: NonAttribute<Control[]>;
  declare static associations: {
    Control: Association<ControlFamily, Control>;
  };
}

ControlFamily.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
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
    modelName: "ControlFamily",
    timestamps: false,
  },
);

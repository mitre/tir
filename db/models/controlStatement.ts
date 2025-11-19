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

export class ControlStatement extends Model<
  InferAttributes<ControlStatement>,
  InferCreationAttributes<ControlStatement>
> {
  declare id: CreationOptional<number>;
  declare ControlId: number;
  declare parentId: number | null;
  declare number: string;
  declare description: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    Control: Association<ControlStatement, Control>;
  };
}

ControlStatement.init(
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
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ControlStatement,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    number: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
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
    modelName: "ControlStatement",
    timestamps: false,
  },
);

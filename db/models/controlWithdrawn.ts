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

export class ControlWithdrawn extends Model<
  InferAttributes<ControlWithdrawn>,
  InferCreationAttributes<ControlWithdrawn>
> {
  declare id: CreationOptional<number>;
  declare controlId: number;
  declare incorporatedInto: number;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    Control: Association<ControlWithdrawn, Control>;
  };
}

ControlWithdrawn.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    controlId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Control,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    incorporatedInto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Control,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    modelName: "ControlWithdrawn",
    timestamps: false,
  },
);

/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class ControlNumber extends Model<
  InferAttributes<ControlNumber>,
  InferCreationAttributes<ControlNumber>
> {
  declare id: CreationOptional<number>;
  declare number: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

ControlNumber.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    number: {
      type: DataTypes.TEXT,
      unique: true,
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
    modelName: "ControlNumber",
    timestamps: false,
  },
);

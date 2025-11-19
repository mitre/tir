/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class ControlClass extends Model<
  InferAttributes<ControlClass>,
  InferCreationAttributes<ControlClass>
> {
  declare id: CreationOptional<number>;
  declare name: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

ControlClass.init(
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
    modelName: "ControlClass",
    timestamps: false,
  },
);

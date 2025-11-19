/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class ControlPriority extends Model<
  InferAttributes<ControlPriority>,
  InferCreationAttributes<ControlPriority>
> {
  declare id: CreationOptional<number>;
  declare level: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

ControlPriority.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    level: {
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
    modelName: "ControlPriority",
    timestamps: false,
  },
);

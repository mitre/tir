/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class ControlRevision extends Model<
  InferAttributes<ControlRevision>,
  InferCreationAttributes<ControlRevision>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare filename: string;
  declare hash: string;
  declare importComplete: boolean;
}

ControlRevision.init(
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
    filename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    importComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ControlRevision",
    timestamps: false,
  },
);

/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

import { Boundary } from "./boundary";

export class Classification extends Model<
  InferAttributes<Classification>,
  InferCreationAttributes<Classification>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare abbreviation: string;
  declare color: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    ClassificationId: Association<Classification, Boundary>;
  };
}

Classification.init(
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
    abbreviation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    color: {
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
    modelName: "Classification",
    timestamps: false,
  },
);

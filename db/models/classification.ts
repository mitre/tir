/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Association,
} from "sequelize";

import { Boundary } from "./boundary";

export class Classification extends Model<
  InferAttributes<Classification>,
  InferCreationAttributes<Classification>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare abbreviation: string;
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
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    abbreviation: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Classification",
    timestamps: false,
  },
);

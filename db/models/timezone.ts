/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class Timezone extends Model<InferAttributes<Timezone>, InferCreationAttributes<Timezone>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare abbreviation: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

Timezone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.TEXT,
    abbreviation: DataTypes.TEXT,
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
    modelName: "Timezone",
    timestamps: false,
  },
);

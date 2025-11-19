/* eslint-disable no-use-before-define */

import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class FrequencyType extends Model<
  InferAttributes<FrequencyType>,
  InferCreationAttributes<FrequencyType>
> {
  declare id: CreationOptional<number>;
  declare frequency: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

FrequencyType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    frequency: {
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
    modelName: "FrequencyType",
    timestamps: false,
  },
);

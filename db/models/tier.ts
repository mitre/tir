/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
} from "sequelize";

export class Tier extends Model<InferAttributes<Tier>, InferCreationAttributes<Tier>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare parentId: number;
  declare hasBoundaries: boolean;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

Tier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
    },
    hasBoundaries: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: "Tier",
    timestamps: false,
  },
);

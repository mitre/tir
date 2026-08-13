/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class CciList extends Model<InferAttributes<CciList>, InferCreationAttributes<CciList>> {
  declare id: CreationOptional<number>;
  declare version: string;
  declare publishdate: string;
  declare importComplete: boolean;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

CciList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    version: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    importComplete: {
      type: DataTypes.BOOLEAN,
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
    modelName: "CciList",
    timestamps: false,
  },
);

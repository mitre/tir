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
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    importComplete: {
      type: DataTypes.BOOLEAN,
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
    modelName: "CciList",
    timestamps: false,
  },
);

/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
} from "sequelize";

export class StigLibrary extends Model<
  InferAttributes<StigLibrary>,
  InferCreationAttributes<StigLibrary>
> {
  declare id: CreationOptional<number>;
  declare filename: string;
  declare hash: string;
  declare classification: string;
  declare libraryDate: string;
  declare version: number;
  declare importedDate: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

StigLibrary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    classification: {
      type: DataTypes.ENUM,
      values: ["U", "CUI", "FOUO"],
      allowNull: true,
    },
    libraryDate: {
      type: DataTypes.STRING(29),
      allowNull: true,
    },
    version: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    importedDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: true, // not set until import is complete
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
    modelName: "StigLibrary",
    timestamps: false,
  },
);

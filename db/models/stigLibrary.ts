/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type BelongsToManyRemoveAssociationMixin,
  type BelongsToManyAddAssociationMixin,
  type NonAttribute,
} from "sequelize";
import type { Stig } from "./stig";

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

  declare Stigs?: NonAttribute<Stig[]>;

  declare addStig: BelongsToManyAddAssociationMixin<Stig, number>;
  declare removeStig: BelongsToManyRemoveAssociationMixin<Stig, number>;
  declare getStigs: () => Promise<Stig[]>;

  declare static associations: {
    Stigs: Association<StigLibrary, Stig>;
  };
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

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
  declare revisionLabel: CreationOptional<string | null>;
  declare labelSource: CreationOptional<string>;
  declare classification: string;
  declare libraryDate: string;
  declare version: CreationOptional<number | null>;
  declare importedDate: CreationOptional<string | null>;
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hash: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    revisionLabel: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    labelSource: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "auto",
    },
    classification: {
      type: DataTypes.ENUM,
      values: ["U", "CUI", "FOUO"],
      allowNull: true,
    },
    libraryDate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    importedDate: {
      type: DataTypes.TEXT,
      allowNull: true, // not set until import is complete
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
    modelName: "StigLibrary",
    timestamps: false,
  },
);

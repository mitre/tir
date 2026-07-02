/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class ImportJob extends Model<
  InferAttributes<ImportJob>,
  InferCreationAttributes<ImportJob>
> {
  declare id: CreationOptional<number>;
  declare uid: string;
  declare filename: string;
  declare status: CreationOptional<string>;
  declare percent: CreationOptional<number>;
  declare message: CreationOptional<string | null>;
  declare result: CreationOptional<string | null>;
  declare error: CreationOptional<string | null>;
  declare stigLibraryId: CreationOptional<number | null>;
  declare createdBy: CreationOptional<number | null>;
  declare creationDate: CreationOptional<string>;
  declare lastUpdate: CreationOptional<string>;
}

ImportJob.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uid: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    filename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "queued",
    },
    percent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stigLibraryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    creationDate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ImportJob",
    timestamps: false,
    noIsoTimestamps: true,
  },
);

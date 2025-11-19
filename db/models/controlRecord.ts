/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  Association,
} from "sequelize";

import { Boundary } from "./boundary";
import { ControlFamily } from "./controlFamily";
import { ControlRevision } from "./controlRevision";
import { ControlRecordItem } from "./controlRecordItem";
export class ControlRecord extends Model<
  InferAttributes<ControlRecord>,
  InferCreationAttributes<ControlRecord>
> {
  declare id: CreationOptional<number>;
  declare BoundaryId: number;
  declare ControlFamilyId: number;
  declare ControlRevisionId: number;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare ControlFamily?: NonAttribute<ControlFamily>;
  declare ControlRecordItems?: NonAttribute<ControlRecordItem[]>;

  declare static associations: {
    ControlFamily: Association<ControlRecord, ControlFamily>;
    ControlRecordItem: Association<ControlRecord, ControlRecordItem>;
    ControlRevision: Association<ControlRecord, ControlRevision>;
  };
}

ControlRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    BoundaryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Boundary,
        key: "id",
      },
    },
    ControlFamilyId: {
      type: DataTypes.INTEGER,
      references: {
        model: ControlFamily,
        key: "id",
      },
    },
    ControlRevisionId: {
      type: DataTypes.INTEGER,
      references: {
        model: ControlRevision,
        key: "id",
      },
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
    modelName: "ControlRecord",
    timestamps: false,
  },
);

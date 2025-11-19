/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  Association,
  type HasManyAddAssociationMixin,
} from "sequelize";
import { ControlNumber } from "./controlNumber";
import { ControlFamily } from "./controlFamily";
import { ControlClass } from "./controlClass";
import { ControlPriority } from "./controlPriority";
import { ControlRevision } from "./controlRevision";
import { ControlRecordItem } from "./controlRecordItem";
import { ControlStatement } from "./controlStatement";
import { ControlEnhancement } from "./controlEnhancement";
import type { ControlReference } from "./controlReference";

export class Control extends Model<InferAttributes<Control>, InferCreationAttributes<Control>> {
  declare id: CreationOptional<number>;
  declare ControlNumberId: number;
  declare ControlFamilyId: number;
  declare title: string;
  declare ControlClassId: number | null;
  declare ControlPriorityId: number | null;
  declare guidance: string;
  declare ControlRevisionId: number | null;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare ControlNumber?: NonAttribute<ControlNumber>;
  declare ControlRevision?: NonAttribute<ControlRevision>;
  declare ControlFamily?: NonAttribute<ControlFamily>;
  declare ControlRecordItems?: NonAttribute<ControlRecordItem[]>;
  declare ControlStatements?: NonAttribute<ControlStatement[]>;
  declare ControlEnhancements?: NonAttribute<ControlEnhancement[]>;

  declare addControlReference: HasManyAddAssociationMixin<ControlReference, number>;

  declare static associations: {
    ControlNumber: Association<Control, ControlNumber>;
    ControlRevision: Association<Control, ControlRevision>;
    ControlFamily: Association<Control, ControlFamily>;
    ControlRecordItem: Association<Control, ControlRecordItem>;
    ControlStatement: Association<Control, ControlStatement>;
    ControlEnhancement: Association<Control, ControlEnhancement>;
  };
}

Control.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ControlNumberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ControlNumber,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    ControlFamilyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ControlFamily,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ControlClassId: {
      type: DataTypes.INTEGER,
      references: {
        model: ControlClass,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    ControlPriorityId: {
      type: DataTypes.INTEGER,
      references: {
        model: ControlPriority,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    guidance: {
      type: DataTypes.TEXT,
    },
    ControlRevisionId: {
      type: DataTypes.INTEGER,
      references: {
        model: ControlRevision,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    modelName: "Control",
    timestamps: false,
  },
);

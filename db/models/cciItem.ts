/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type HasManyAddAssociationMixin,
  type HasManyHasAssociationMixin,
  type ForeignKey,
  type NonAttribute,
} from "sequelize";
import { CciReference } from "./cciReferences";
import { CciList } from "./cciList";

export class CciItem extends Model<InferAttributes<CciItem>, InferCreationAttributes<CciItem>> {
  declare id: CreationOptional<number>;
  declare cciId: string;
  declare status: string;
  declare publishdate: string;
  declare contributor: string;
  declare definition: string;
  declare typePolicy: boolean;
  declare typeTechnical: boolean;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare CciListId: ForeignKey<CciList["id"]>;

  declare addCciReference: HasManyAddAssociationMixin<CciReference, number>;
  declare hasCciReference: HasManyHasAssociationMixin<CciReference, number>;

  declare CciReferences?: NonAttribute<CciReference[]>;

  declare static associations: {
    CciReferences: Association<CciItem, CciReference>;
  };
}

CciItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cciId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "deprecated"),
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contributor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    typePolicy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    typeTechnical: {
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
    modelName: "CciItem",
    timestamps: false,
  },
);

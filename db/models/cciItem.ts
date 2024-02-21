/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  ForeignKey,
  NonAttribute,
  Association,
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
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "deprecated"),
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    contributor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    definition: {
      type: DataTypes.STRING(1024),
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
    modelName: "CciItem",
    timestamps: false,
  },
);

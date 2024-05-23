/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type HasManyAddAssociationMixin,
  type HasManyHasAssociationMixin,
  type ForeignKey,
} from "sequelize";
import { PolicyDocument } from "./policyDocument";

export class CciReference extends Model<
  InferAttributes<CciReference>,
  InferCreationAttributes<CciReference>
> {
  declare id: CreationOptional<number>;
  declare creator: string;
  declare location: string;
  declare index: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare PolicyDocumentId: ForeignKey<PolicyDocument["id"]>;
  declare hasPolicyDocument: HasManyHasAssociationMixin<PolicyDocument, number>;
  declare addPolicyDocument: HasManyAddAssociationMixin<PolicyDocument, number>;
}

CciReference.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    index: {
      type: DataTypes.STRING,
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
    modelName: "CciReference",
    timestamps: false,
  },
);

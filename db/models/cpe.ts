/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type HasManyAddAssociationMixin,
} from "sequelize";
import { CpePart } from "./cpePart";
import { CpeVendor } from "./cpeVendor";
import { CpeProduct } from "./cpeProduct";

export class Cpe extends Model<InferAttributes<Cpe>, InferCreationAttributes<Cpe>> {
  declare id: CreationOptional<number>;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare CpePartId: ForeignKey<CpePart["id"]>;
  declare CpeVendorId: ForeignKey<CpeVendor["id"]>;
  declare CpeProductId: ForeignKey<CpeProduct["id"]>;

  declare addCpePart: HasManyAddAssociationMixin<CpePart, number>;
  declare addCpeVendor: HasManyAddAssociationMixin<CpeVendor, number>;
  declare addCpeProduct: HasManyAddAssociationMixin<CpeProduct, number>;
}

Cpe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    CpePartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CpeParts",
        key: "id",
      },
    },
    CpeVendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CpeVendors",
        key: "id",
      },
    },
    CpeProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CpeProducts",
        key: "id",
      },
    },
    lastUpdate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Cpe",
    timestamps: false,
  },
);

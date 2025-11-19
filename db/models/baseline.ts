/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type HasManyAddAssociationMixin,
  type NonAttribute,
  Association,
  type HasManyHasAssociationMixin,
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyHasAssociationMixin,
} from "sequelize";
import type { ControlEnhancement } from "./controlEnhancement";
import type { Control } from "./controls";

export class Baseline extends Model<InferAttributes<Baseline>, InferCreationAttributes<Baseline>> {
  declare id: CreationOptional<number>;
  declare name: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare hasControl: HasManyHasAssociationMixin<Control, number>;
  declare addControl: HasManyAddAssociationMixin<Control, number>;

  declare hasControlEnhancement: BelongsToManyHasAssociationMixin<ControlEnhancement, number>;
  declare addControlEnhancement: BelongsToManyAddAssociationMixin<ControlEnhancement, number>;

  declare Controls?: NonAttribute<Control[]>;
  declare ControlEnhancements?: NonAttribute<ControlEnhancement[]>;

  declare static associations: {
    ControlEnchancements: Association<Baseline, ControlEnhancement>;
    Controls: Association<Baseline, Control>;
  };
}

Baseline.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
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
    modelName: "Baseline",
    timestamps: false,
  },
);

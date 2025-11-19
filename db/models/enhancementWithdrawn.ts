/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  Association,
} from "sequelize";
import type { ControlEnhancement } from "./controlEnhancement";

export class EnhancementWithdrawn extends Model<
  InferAttributes<EnhancementWithdrawn>,
  InferCreationAttributes<EnhancementWithdrawn>
> {
  declare id: CreationOptional<number>;
  declare ControlEnhancementId: number;
  declare incorporatedInto: number;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    ControlEnhancement: Association<EnhancementWithdrawn, ControlEnhancement>;
  };
}

EnhancementWithdrawn.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ControlEnhancementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ControlEnhancement",
        key: "id",
      },
    },
    incorporatedInto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Control",
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
    modelName: "EnhancementWithdrawn",
    timestamps: false,
  },
);

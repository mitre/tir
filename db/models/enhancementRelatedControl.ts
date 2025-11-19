/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  Association,
} from "sequelize";
import { ControlEnhancement } from "./controlEnhancement";
export class EnhancementRelatedControl extends Model<
  InferAttributes<EnhancementRelatedControl>,
  InferCreationAttributes<EnhancementRelatedControl>
> {
  declare id: CreationOptional<number>;
  declare ControlEnhancementId: number;
  declare relatedControl: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    ControlEnhancement: Association<EnhancementRelatedControl, ControlEnhancement>;
  };
}

EnhancementRelatedControl.init(
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
        model: ControlEnhancement,
        key: "id",
      },
    },
    relatedControl: {
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
    modelName: "EnhancementRelatedControl",
    timestamps: false,
  },
);

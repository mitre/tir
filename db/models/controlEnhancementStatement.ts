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

export class ControlEnhancementStatement extends Model<
  InferAttributes<ControlEnhancementStatement>,
  InferCreationAttributes<ControlEnhancementStatement>
> {
  declare id: CreationOptional<number>;
  declare ControlEnhancementId: number;
  declare parentId: number | null;
  declare number: string;
  declare description: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    ControlEnhancement: Association<ControlEnhancementStatement, ControlEnhancement>;
    ControlEnhancementStatements: Association<
      ControlEnhancementStatement,
      ControlEnhancementStatement
    >;
  };
}

ControlEnhancementStatement.init(
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
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ControlEnhancementStatement,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    number: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
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
    modelName: "ControlEnhancementStatement",
    timestamps: false,
  },
);

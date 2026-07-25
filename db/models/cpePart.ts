/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class CpePart extends Model<InferAttributes<CpePart>, InferCreationAttributes<CpePart>> {
  declare id: CreationOptional<number>;
  declare partCode: string;
  declare partDefinition: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

CpePart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    partCode: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    partDefinition: {
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
    modelName: "CpePart",
    timestamps: false,
  },
);

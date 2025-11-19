/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class RiskLevel extends Model<
  InferAttributes<RiskLevel>,
  InferCreationAttributes<RiskLevel>
> {
  declare id: CreationOptional<number>;
  declare level: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

RiskLevel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    level: {
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
    modelName: "RiskLevel",
    timestamps: false,
  },
);

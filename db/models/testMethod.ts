/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class TestMethod extends Model<
  InferAttributes<TestMethod>,
  InferCreationAttributes<TestMethod>
> {
  declare id: CreationOptional<number>;
  declare method: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

TestMethod.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    method: {
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
    modelName: "TestMethod",
    timestamps: false,
  },
);

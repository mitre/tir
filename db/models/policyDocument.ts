/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class PolicyDocument extends Model<
  InferAttributes<PolicyDocument>,
  InferCreationAttributes<PolicyDocument>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare version: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

PolicyDocument.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: "TitleVersion",
    },
    version: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: "TitleVersion",
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
    modelName: "PolicyDocument",
    timestamps: false,
  },
);

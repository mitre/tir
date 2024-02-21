/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
} from "sequelize";

// order of InferAttributes & InferCreationAttributes is important.
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
      type: DataTypes.STRING,
      allowNull: false,
      unique: "TitleVersion",
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "TitleVersion",
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
    modelName: "PolicyDocument",
    timestamps: false,
  },
);

/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class StigReference extends Model<
  InferAttributes<StigReference>,
  InferCreationAttributes<StigReference>
> {
  declare id: CreationOptional<number>;
  declare dc_identifier: string;
  declare dc_publisher: string;
  declare dc_subject: string;
  declare dc_title: string;
  declare dc_type: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}
StigReference.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    dc_identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_publisher: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_type: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "StigReference",
    timestamps: false,
  },
);

/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class StigIdent extends Model<
  InferAttributes<StigIdent>,
  InferCreationAttributes<StigIdent>
> {
  declare id: CreationOptional<number>;
  declare system: string;
  declare text: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

StigIdent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    system: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
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
    modelName: "StigIdent",
    timestamps: false,
  },
);

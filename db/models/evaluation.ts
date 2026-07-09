/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { Boundary } from "./boundary";
import { Stig } from "./stig";

export class Evaluation extends Model<
  InferAttributes<Evaluation>,
  InferCreationAttributes<Evaluation>
> {
  declare id: CreationOptional<number>;
  declare classification: string;
  declare customname: string;
  declare comment: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare BoundaryId: ForeignKey<Boundary["id"]>;
  declare StigId: ForeignKey<Stig["id"]>;
}

Evaluation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    classification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: "Evaluation",
    timestamps: false,
  },
);

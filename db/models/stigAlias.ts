/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";

export class StigAlias extends Model<
  InferAttributes<StigAlias>,
  InferCreationAttributes<StigAlias>
> {
  declare id: CreationOptional<number>;
  declare alias: string;
  declare identifier: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
}

StigAlias.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    alias: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    identifier: {
      type: DataTypes.STRING(64),
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
    modelName: "StigAlias",
    timestamps: false,
  },
);

/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type NonAttribute,
} from "sequelize";

import type { StigData } from "~/db/models/stigData";
import { System } from "~/db/models/system";

export class StigOverride extends Model<
  InferAttributes<StigOverride>,
  InferCreationAttributes<StigOverride>
> {
  declare id: CreationOptional<number>;
  declare type: string;
  declare value: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare SystemId: ForeignKey<System["id"]>;
  declare StigDatumId: ForeignKey<StigData["id"]>;

  declare System: NonAttribute<System>;
  declare StigData: NonAttribute<StigData>;

  declare static associations: {
    SystemId: Association<StigOverride, System>;
    StigData: Association<StigOverride, StigData>;
  };
}

StigOverride.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
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
    modelName: "StigOverride",
    timestamps: false,
  },
);

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

import { System } from "~/db/models/system";
import type { NessusPlugin } from "~/db/models/nessusPlugin";

export class NessusOverride extends Model<
  InferAttributes<NessusOverride>,
  InferCreationAttributes<NessusOverride>
> {
  declare id: CreationOptional<number>;
  declare type: string;
  declare value: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare SystemId: ForeignKey<System["id"]>;
  declare NessusPluginId: ForeignKey<NessusPlugin["id"]>;

  declare System: NonAttribute<System>;
  declare NessusPlugin: NonAttribute<NessusPlugin>;

  declare static associations: {
    SystemId: Association<NessusOverride, System>;
    NessusPluginId: Association<NessusOverride, NessusPlugin>;
  };
}

NessusOverride.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    value: {
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
    modelName: "NessusOverride",
    timestamps: false,
  },
);

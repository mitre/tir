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

import type { Cve } from "~/db/models/cve";
import { System } from "~/db/models/system";

export class CveOverride extends Model<
  InferAttributes<CveOverride>,
  InferCreationAttributes<CveOverride>
> {
  declare id: CreationOptional<number>;
  declare status: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare SystemId: ForeignKey<System["id"]>;
  declare CveId: ForeignKey<Cve["id"]>;

  declare System: NonAttribute<System>;
  declare Cve: NonAttribute<Cve>;

  declare static associations: {
    SystemId: Association<CveOverride, System>;
    CveId: Association<CveOverride, Cve>;
  };
}

CveOverride.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["Open", "NotAFinding", "Not_Applicable", "None"],
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
    modelName: "CveOverride",
    timestamps: false,
  },
);

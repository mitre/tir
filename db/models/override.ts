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

import { StigData } from "./stigData";
import { System } from "./system";

export class Override extends Model<InferAttributes<Override>, InferCreationAttributes<Override>> {
  declare id: CreationOptional<number>;
  declare status: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare SystemId: ForeignKey<System["id"]>;
  declare StigDatumId: ForeignKey<StigData["id"]>;

  declare System: NonAttribute<System>;

  declare static associations: {
    SystemId: Association<Override, System>;
    StigDatumId: Association<Override, StigData>;
  };
}

Override.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["Not_Reviewed", "Open", "NotAFinding", "Not_Applicable", "None"],
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
    modelName: "Override",
    timestamps: false,
  },
);

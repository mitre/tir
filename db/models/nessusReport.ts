/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type NonAttribute,
} from "sequelize";
import { System } from "~/db/models";
import { NessusReportItem } from "~/db/models/nessusReportItem";

export class NessusReport extends Model<
  InferAttributes<NessusReport>,
  InferCreationAttributes<NessusReport>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare reportHostName: string;
  declare hash: string;

  declare SystemId: ForeignKey<System["id"]>;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare System?: NonAttribute<System>;
  declare NessusReportItems?: NonAttribute<NessusReportItem[]>;
}

NessusReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reportHostName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hash: {
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
    modelName: "NessusReport",
    timestamps: false,
  },
);

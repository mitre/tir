/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type NonAttribute,
  Association,
  type BelongsToManyAddAssociationMixin,
} from "sequelize";

import { NessusPluginFamily } from "./nessusPluginFamily";
import { Cve } from "./cve";
import { Cpe } from "./cpe";
import { NessusReportItem } from "./nessusReportItem";
import type { Boundary } from "~/db/models/boundary";

export class NessusPlugin extends Model<
  InferAttributes<NessusPlugin>,
  InferCreationAttributes<NessusPlugin>
> {
  declare id: CreationOptional<number>;
  declare pluginId: number;
  declare pluginPublicationDate: string;
  declare pluginModificationDate: string;
  declare pluginName: string;
  declare fname: string;
  declare scriptVersion: string;
  declare severity: number;
  declare pluginType: string;
  declare riskFactor: string;
  declare description: string;
  declare solution: string;
  declare synopsis: string;

  declare NessusPluginFamilyId: ForeignKey<NessusPluginFamily["id"]>;
  declare Cves?: NonAttribute<Cve[]>;
  declare Cpes?: NonAttribute<Cpe[]>;
  declare NessusReportItems?: NonAttribute<NessusReportItem[]>;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
  declare Boundaries?: NonAttribute<Boundary[]>;
  declare addBoundary: BelongsToManyAddAssociationMixin<Boundary, number>;

  declare static associations: {
    NessusReportItems: Association<NessusPlugin, NessusReportItem>;
    Boundaries: Association<NessusPlugin, Boundary>;
  };
}

NessusPlugin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    pluginId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pluginPublicationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pluginModificationDate: {
      type: DataTypes.STRING,
    },
    pluginName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scriptVersion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    severity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pluginType: {
      type: DataTypes.ENUM,
      values: ["local", "remote", "mixed"],
      allowNull: false,
    },
    riskFactor: {
      type: DataTypes.ENUM,
      values: ["None", "Low", "Medium", "High", "Critical"],
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    synopsis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "NessusPlugin",
    timestamps: false,
  },
);

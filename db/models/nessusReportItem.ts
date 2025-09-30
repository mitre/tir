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
import type { NessusPlugin } from "./nessusPlugin";
import type { NessusReport } from "./nessusReport";
import type { Protocol } from "~/db/models/protocols";
import type { EvaluationItem } from "~/db/models/evaluationItem";
import type { NessusServiceName } from "~/db/models/nessusServiceName";

export class NessusReportItem extends Model<
  InferAttributes<NessusReportItem>,
  InferCreationAttributes<NessusReportItem>
> {
  declare id: CreationOptional<number>;
  declare port: number;
  declare ageOfVuln: string;
  declare cisaKnownExploited: string;
  declare agent: string;
  declare alwaysRun: string;
  declare assetCategories: string;
  declare assetInventory: string;
  declare assetInventoryCategory: string;
  declare bid: number;
  declare cvss3TemporalVector: string;
  declare cvss3TemporalScore: number;
  declare cvssTemporalVector: string;
  declare cvssTemporalScore: number;
  declare cert: number;
  declare canvasPackage: string;
  declare ceaId: string;
  declare pluginOutput: string;
  declare severityOverride: number | null;
  declare severityOverrideJustification: string | null;
  declare statusOverride: string | null;
  declare statusOverrideJustification: string | null;
  declare NessusPluginId: ForeignKey<NessusPlugin["id"]>;
  declare EvaluationItemId: ForeignKey<EvaluationItem["id"]>;
  declare NessusReportItemId: ForeignKey<NessusReportItem["id"]>;
  declare NessusServiceNameId: ForeignKey<NessusServiceName["id"]>;
  declare ProtocolId: ForeignKey<Protocol["id"]>;
  declare NessusReportId: ForeignKey<NessusReport["id"]>;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
  declare NessusReport?: NonAttribute<NessusReport>;
}

NessusReportItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ageOfVuln: {
      type: DataTypes.STRING,
    },
    cisaKnownExploited: {
      type: DataTypes.STRING,
    },
    agent: {
      type: DataTypes.STRING,
    },
    alwaysRun: {
      type: DataTypes.STRING,
    },
    assetCategories: {
      type: DataTypes.STRING,
    },
    assetInventory: {
      type: DataTypes.STRING,
    },
    assetInventoryCategory: {
      type: DataTypes.STRING,
    },
    bid: {
      type: DataTypes.INTEGER,
    },
    cvss3TemporalVector: {
      type: DataTypes.STRING,
    },
    cvss3TemporalScore: {
      type: DataTypes.DECIMAL,
    },
    cvssTemporalVector: {
      type: DataTypes.STRING,
    },
    cvssTemporalScore: {
      type: DataTypes.INTEGER,
    },
    cert: {
      type: DataTypes.INTEGER,
    },
    canvasPackage: {
      type: DataTypes.STRING,
    },
    ceaId: {
      type: DataTypes.STRING,
    },
    pluginOutput: {
      type: DataTypes.STRING,
    },
    severityOverride: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    severityOverrideJustification: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    statusOverride: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["Not_Reviewed", "Open", "NotAFinding", "Not_Applicable"],
    },
    statusOverrideJustification: {
      type: DataTypes.STRING,
    },
    NessusPluginId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "NessusPlugin",
        key: "id",
      },
    },
    NessusServiceNameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "NessusServiceName",
        key: "id",
      },
    },
    ProtocolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Protocols",
        key: "id",
      },
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
    modelName: "NessusReportItem",
    timestamps: false,
  },
);

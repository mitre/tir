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
  declare NessusPlugin?: NonAttribute<NessusPlugin>;

  declare static associations: {
    NessusPlugin: Association<NessusReportItem, NessusPlugin>;
  };
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
      type: DataTypes.TEXT,
    },
    cisaKnownExploited: {
      type: DataTypes.TEXT,
    },
    agent: {
      type: DataTypes.TEXT,
    },
    alwaysRun: {
      type: DataTypes.TEXT,
    },
    assetCategories: {
      type: DataTypes.TEXT,
    },
    assetInventory: {
      type: DataTypes.TEXT,
    },
    assetInventoryCategory: {
      type: DataTypes.TEXT,
    },
    bid: {
      type: DataTypes.INTEGER,
    },
    cvss3TemporalVector: {
      type: DataTypes.TEXT,
    },
    cvss3TemporalScore: {
      type: DataTypes.DECIMAL,
    },
    cvssTemporalVector: {
      type: DataTypes.TEXT,
    },
    cvssTemporalScore: {
      type: DataTypes.INTEGER,
    },
    cert: {
      type: DataTypes.INTEGER,
    },
    canvasPackage: {
      type: DataTypes.TEXT,
    },
    ceaId: {
      type: DataTypes.TEXT,
    },
    pluginOutput: {
      type: DataTypes.TEXT,
    },
    severityOverride: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    severityOverrideJustification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statusOverride: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ["Not_Reviewed", "Open", "NotAFinding", "Not_Applicable"],
    },
    statusOverrideJustification: {
      type: DataTypes.TEXT,
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
    modelName: "NessusReportItem",
    timestamps: false,
  },
);

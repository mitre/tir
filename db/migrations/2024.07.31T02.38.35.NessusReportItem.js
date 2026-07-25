import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("NessusReportItems", {
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
      type: DataTypes.DECIMAL(3, 1),
    },
    cvssTemporalVector: {
      type: DataTypes.TEXT,
    },
    cvssTemporalScore: {
      type: DataTypes.DECIMAL(3, 1),
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
      type: DataTypes.INTEGER,
    },
    severityOverrideJustification: {
      type: DataTypes.TEXT,
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
        model: "NessusPlugins",
        key: "id",
      },
    },
    NessusServiceNameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "NessusServiceNames",
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
    NessusReportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "NessusReports",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    EvaluationItemId: {
      type: DataTypes.INTEGER,
      references: {
        model: "EvaluationItems",
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
  });
};
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("NessusReportItems");
};

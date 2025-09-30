import { DataTypes } from "sequelize";

import { sequelize, DATETIME_LENGTH } from "../umzug.js";
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
      type: DataTypes.DECIMAL(3, 1),
    },
    cvssTemporalVector: {
      type: DataTypes.STRING,
    },
    cvssTemporalScore: {
      type: DataTypes.DECIMAL(3, 1),
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
      type: DataTypes.TEXT,
    },
    severityOverride: {
      type: DataTypes.INTEGER,
    },
    severityOverrideJustification: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("NessusReportItems");
};

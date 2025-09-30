import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

const NessusPluginTypes = {
  Combined: "combined",
  Local: "local",
  Remote: "remote",
  Summary: "summary",
};

export const up = async () => {
  await sequelize.getQueryInterface().createTable("NessusPlugins", {
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
      values: Object.values(NessusPluginTypes),
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
    NessusPluginFamilyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "NessusPluginFamilies",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
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
  await sequelize.getQueryInterface().createTable("Cve_NessusPlugins", {
    CveId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Cves",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    NessusPluginId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "NessusPlugins",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("Cve_NessusPlugins");
  await sequelize.getQueryInterface().dropTable("NessusPlugins");
};

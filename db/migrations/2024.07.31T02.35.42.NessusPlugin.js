import { DataTypes } from "sequelize";

const NessusPluginTypes = {
  Combined: "combined",
  Local: "local",
  Remote: "remote",
  Summary: "summary",
};

export const up = async ({ context: sequelize }) => {
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pluginModificationDate: {
      type: DataTypes.TEXT,
    },
    pluginName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fname: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scriptVersion: {
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
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

export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("Cve_NessusPlugins");
  await sequelize.getQueryInterface().dropTable("NessusPlugins");
};

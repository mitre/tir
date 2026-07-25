import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("Stigs", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    dc: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    xsi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cpe: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    xhtml: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dsig: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    schemaLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stigid: {
      // Same as Benchmark.id in XML
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lang: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    xmlns: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status__date: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notice__id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notice__lang: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    front_matter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rear_matter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reference__href: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reference__publisher: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reference__source: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plain_text__release_info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plain_text__generator: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plain_text__conventionsVersion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stigRelease: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    stigDate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    filename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    MAC1C: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC1P: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC1S: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC2C: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC2P: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC2S: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC3C: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC3P: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC3S: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("Stigs");
};

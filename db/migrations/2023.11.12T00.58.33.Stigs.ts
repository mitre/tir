import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("Stigs", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    dc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xhtml: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dsig: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    schemaLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stigid: {
      // Same as Benchmark.id in XML
      type: DataTypes.STRING,
      allowNull: false,
    },
    lang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xmlns: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status__date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    notice__id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notice__lang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    front_matter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rear_matter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference__href: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference__publisher: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference__source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plain_text__release_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plain_text__generator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plain_text__conventionsVersion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stigRelease: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    stigDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
  });
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("Stigs");
};

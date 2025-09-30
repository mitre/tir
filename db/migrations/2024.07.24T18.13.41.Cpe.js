import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("CpeParts", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    partCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    partDefinition: {
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
  });
  await sequelize.getQueryInterface().createTable("CpeVendors", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cpeVendorString: {
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
  });
  await sequelize.getQueryInterface().createTable("CpeProducts", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cpeProductString: {
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
  });
  await sequelize.getQueryInterface().createTable("Cpes", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cpePartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CpeParts",
        key: "id",
      },
    },
    cpeVendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CpeVendors",
        key: "id",
      },
    },
    cpeProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CpeProducts",
        key: "id",
      },
    },
  });
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("cpeParts");
  await sequelize.getQueryInterface().dropTable("CpeVendors");
  await sequelize.getQueryInterface().dropTable("CpeProducts");
  await sequelize.getQueryInterface().dropTable("Cpes");
};

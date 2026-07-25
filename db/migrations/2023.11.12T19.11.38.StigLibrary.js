import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("StigLibraries", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    filename: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    hash: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    classification: {
      type: DataTypes.ENUM,
      values: ["U", "CUI", "FOUO"],
      allowNull: true,
    },
    libraryDate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    importedDate: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  await sequelize.getQueryInterface().addColumn("Boundaries", "StigLibraryId", {
    type: DataTypes.INTEGER,
    references: {
      model: "StigLibraries",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });
  await sequelize.getQueryInterface().createTable("StigLibrary_Stigs", {
    StigId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Stigs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    StigLibraryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "StigLibraries",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};
export const down = async () => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Boundaries", "StigLibraryId");
    await sequelize.getQueryInterface().changeColumn("Boundaries", "TierId", {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Tiers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  } else {
    await sequelize.query(
      "CREATE TABLE `Boundaries_backup` (`creationDate` TEXT NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastUpdate` TEXT NOT NULL, `name` TEXT NOT NULL UNIQUE, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries_backup` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId` FROM `Boundaries`;",
    );
    await sequelize.query("DROP TABLE `Boundaries`;");
    await sequelize.query(
      "CREATE TABLE `Boundaries` (`creationDate` TEXT NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastUpdate` TEXT NOT NULL, `name` TEXT NOT NULL UNIQUE, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId` FROM `Boundaries_backup`;",
    );
    await sequelize.query("DROP TABLE `Boundaries_backup`;");
  }
  await sequelize.getQueryInterface().dropTable("StigLibraries");
  await sequelize.getQueryInterface().dropTable("StigLibrary_Stigs");
};

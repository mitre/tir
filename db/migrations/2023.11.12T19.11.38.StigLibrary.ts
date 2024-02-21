import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("StigLibraries", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    classification: {
      type: DataTypes.ENUM,
      values: ["U", "CUI", "FOUO"],
      allowNull: true,
    },
    libraryDate: {
      type: DataTypes.STRING(29),
      allowNull: true,
    },
    version: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    importedDate: {
      type: DataTypes.STRING(29),
      allowNull: true,
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

export const down: MigrationFn = async () => {
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
      "CREATE TABLE `Boundaries_backup` (`creationDate` VARCHAR(29) NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastUpdate` VARCHAR(29) NOT NULL, `name` VARCHAR(255) NOT NULL UNIQUE, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries_backup` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId` FROM `Boundaries`;",
    );
    await sequelize.query("DROP TABLE `Boundaries`;");
    await sequelize.query(
      "CREATE TABLE `Boundaries` (`creationDate` VARCHAR(29) NOT NULL, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `lastUpdate` VARCHAR(29) NOT NULL, `name` VARCHAR(255) NOT NULL UNIQUE, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId` FROM `Boundaries_backup`;",
    );
    await sequelize.query("DROP TABLE `Boundaries_backup`;");
  }

  await sequelize.getQueryInterface().dropTable("StigLibraries");
  await sequelize.getQueryInterface().dropTable("StigLibrary_Stigs");
};

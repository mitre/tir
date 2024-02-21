import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("Classifications", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    abbreviation: {
      type: DataTypes.STRING(5),
      allowNull: false,
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

  await sequelize.getQueryInterface().addColumn("Boundaries", "ClassificationId", {
    type: DataTypes.INTEGER,
    references: {
      model: "Classifications",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  await sequelize.getQueryInterface().addColumn("Boundaries", "caveats", {
    type: DataTypes.STRING(50),
    allowNull: true,
  });
};

export const down: MigrationFn = async () => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Boundaries", "ClassificationId");
  } else {
    await sequelize.query(
      "CREATE TABLE `Boundaries_backup` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` VARCHAR(255) NOT NULL UNIQUE, `lastUpdate` VARCHAR(29) NOT NULL, `creationDate` VARCHAR(29) NOT NULL, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `StigLibraryId` INTEGER REFERENCES `StigLibraries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE, `PolicyDocumentId` INTEGER NOT NULL REFERENCES `PolicyDocuments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries_backup` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId`, `PolicyDocumentId` FROM `Boundaries`;",
    );
    await sequelize.query("DROP TABLE `Boundaries`;");
    await sequelize.query(
      "CREATE TABLE `Boundaries` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` VARCHAR(255) NOT NULL UNIQUE, `lastUpdate` VARCHAR(29) NOT NULL, `creationDate` VARCHAR(29) NOT NULL, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `StigLibraryId` INTEGER REFERENCES `StigLibraries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE, `PolicyDocumentId` INTEGER NOT NULL REFERENCES `PolicyDocuments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId`, `PolicyDocumentId` FROM `Boundaries_backup`;",
    );
    await sequelize.query("DROP TABLE `Boundaries_backup`;");
  }

  await sequelize.getQueryInterface().dropTable("Classifications");
};

import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("Classifications", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    abbreviation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    color: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    type: DataTypes.TEXT,
    allowNull: true,
  });
};
export const down = async ({ context: sequelize }) => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Boundaries", "ClassificationId");
    await sequelize.getQueryInterface().removeColumn("Boundaries", "caveats");
  } else {
    await sequelize.query(
      "CREATE TABLE `Boundaries_backup` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT NOT NULL UNIQUE, `lastUpdate` TEXT NOT NULL, `creationDate` TEXT NOT NULL, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `StigLibraryId` INTEGER REFERENCES `StigLibraries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE, `PolicyDocumentId` INTEGER NOT NULL REFERENCES `PolicyDocuments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries_backup` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId`, `PolicyDocumentId` FROM `Boundaries`;",
    );
    await sequelize.query("DROP TABLE `Boundaries`;");
    await sequelize.query(
      "CREATE TABLE `Boundaries` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT NOT NULL UNIQUE, `lastUpdate` TEXT NOT NULL, `creationDate` TEXT NOT NULL, `ownerId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, `TierId` INTEGER NOT NULL REFERENCES `Tiers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `StigLibraryId` INTEGER REFERENCES `StigLibraries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE, `PolicyDocumentId` INTEGER NOT NULL REFERENCES `PolicyDocuments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE);",
    );
    await sequelize.query(
      "INSERT INTO `Boundaries` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId`, `PolicyDocumentId` FROM `Boundaries_backup`;",
    );
    await sequelize.query("DROP TABLE `Boundaries_backup`;");
  }
  await sequelize.getQueryInterface().dropTable("Classifications");
};

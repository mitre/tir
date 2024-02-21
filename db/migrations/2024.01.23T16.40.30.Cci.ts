import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("CciLists", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    version: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    importComplete: {
      type: DataTypes.BOOLEAN,
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

  await sequelize.getQueryInterface().createTable("CciItems", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cciId: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "deprecated"),
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    contributor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    definition: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    typePolicy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    typeTechnical: {
      type: DataTypes.BOOLEAN,
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
    CciListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CciLists",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });

  await sequelize.getQueryInterface().createTable("PolicyDocuments", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "TitleVersion",
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "TitleVersion",
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

  await sequelize
    .getQueryInterface()
    .addConstraint("PolicyDocuments", { type: "unique", fields: ["title", "version"] });

  await sequelize.getQueryInterface().createTable("CciReferences", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    index: {
      type: DataTypes.STRING,
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
    PolicyDocumentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "PolicyDocuments",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  });

  await sequelize.getQueryInterface().createTable("CciItem_CciReferences", {
    CciItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "CciItems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    CciReferenceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "CciReferences",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });

  await sequelize.getQueryInterface().addColumn("Boundaries", "PolicyDocumentId", {
    type: DataTypes.INTEGER,
    references: {
      model: "PolicyDocuments",
      key: "id",
    },
    allowNull: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("CciItem_CciReferences");
  await sequelize.getQueryInterface().dropTable("CciReferences");
  await sequelize.getQueryInterface().dropTable("PolicyDocuments");
  await sequelize.getQueryInterface().dropTable("CciItems");
  await sequelize.getQueryInterface().dropTable("CciLists");
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Boundaries", "PolicyDocumentId");
  } else {
    await sequelize.query(
      `CREATE TABLE 'Boundaries_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'name' VARCHAR(255) NOT NULL UNIQUE, 'lastUpdate' VARCHAR(29) NOT NULL, 'creationDate' VARCHAR(29) NOT NULL, 'ownerId' INTEGER REFERENCES 'Users' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TierId' INTEGER NOT NULL REFERENCES 'Tiers' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigLibraryId' INTEGER REFERENCES 'StigLibraries' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Boundaries_backup` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId` FROM `Boundaries`;",
    );
    await sequelize.query("DROP TABLE `Boundaries`;");
    await sequelize.query(
      `CREATE TABLE 'Boundaries' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'name' VARCHAR(255) NOT NULL UNIQUE, 'lastUpdate' VARCHAR(29) NOT NULL, 'creationDate' VARCHAR(29) NOT NULL, 'ownerId' INTEGER REFERENCES 'Users' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TierId' INTEGER NOT NULL REFERENCES 'Tiers' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigLibraryId' INTEGER REFERENCES 'StigLibraries' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Boundaries` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId` FROM `Boundaries_backup`;",
    );
    await sequelize.query("DROP TABLE `Boundaries_backup`;");
  }
};

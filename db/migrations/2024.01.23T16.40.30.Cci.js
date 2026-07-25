import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("CciLists", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    version: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    importComplete: {
      type: DataTypes.BOOLEAN,
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
  await sequelize.getQueryInterface().createTable("CciItems", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cciId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "deprecated"),
      allowNull: false,
    },
    publishdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contributor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    definition: {
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
      allowNull: false,
      unique: "TitleVersion",
    },
    version: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: "TitleVersion",
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    index: {
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
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("CciItem_CciReferences");
  await sequelize.getQueryInterface().dropTable("CciReferences");
  await sequelize.getQueryInterface().dropTable("PolicyDocuments");
  await sequelize.getQueryInterface().dropTable("CciItems");
  await sequelize.getQueryInterface().dropTable("CciLists");
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().removeColumn("Boundaries", "PolicyDocumentId");
  } else {
    await sequelize.query(
      `CREATE TABLE 'Boundaries_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'name' TEXT NOT NULL UNIQUE, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL, 'ownerId' INTEGER REFERENCES 'Users' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TierId' INTEGER NOT NULL REFERENCES 'Tiers' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigLibraryId' INTEGER REFERENCES 'StigLibraries' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Boundaries_backup` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId` FROM `Boundaries`;",
    );
    await sequelize.query("DROP TABLE `Boundaries`;");
    await sequelize.query(
      `CREATE TABLE 'Boundaries' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'name' TEXT NOT NULL UNIQUE, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL, 'ownerId' INTEGER REFERENCES 'Users' ('id') ON DELETE SET NULL ON UPDATE CASCADE, 'TierId' INTEGER NOT NULL REFERENCES 'Tiers' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigLibraryId' INTEGER REFERENCES 'StigLibraries' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `Boundaries` SELECT `id`, `name`, `lastUpdate`, `creationDate`, `ownerId`, `TierId`, `StigLibraryId` FROM `Boundaries_backup`;",
    );
    await sequelize.query("DROP TABLE `Boundaries_backup`;");
  }
};

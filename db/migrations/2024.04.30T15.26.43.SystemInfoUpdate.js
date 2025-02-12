import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  const transaction = await sequelize.transaction();
  try {
    if (sequelize.getDialect() === "postgres") {
      await sequelize
        .getQueryInterface()
        .renameColumn("Systems", "hostname", "hostName", { transaction });
    }
    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query(`PRAGMA foreign_keys = OFF;`, { transaction });
      await sequelize.query(
        `
        CREATE TABLE "Systems_backup" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "hostName" TEXT, "BoundaryId" INTEGER REFERENCES "Boundaries" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
      `,
        { transaction },
      );
      await sequelize.query(
        `
        INSERT INTO "Systems_backup" 
        SELECT "id", "name", "lastUpdate", "creationDate", "hostname", "BoundaryId"
        FROM "Systems";
        `,
        { transaction },
      );
      await sequelize.query(`DROP TABLE "Systems";`, { transaction });
      await sequelize.query(
        `
        CREATE TABLE "Systems" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "hostName" TEXT, "BoundaryId" INTEGER REFERENCES "Boundaries" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
      `,
        { transaction },
      );
      await sequelize.query(
        `
        INSERT INTO "Systems" 
        SELECT "id", "name", "lastUpdate", "creationDate", "hostName", "BoundaryId"
        FROM "Systems_backup";
        `,
        { transaction },
      );
      await sequelize.query(`DROP TABLE "Systems_backup";`, { transaction });
    }
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "role",
      {
        type: DataTypes.ENUM,
        values: ["None", "Workstation", "Member Server", "Domain Controller"],
        allowNull: false,
        defaultValue: "None",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "assetType",
      {
        type: DataTypes.ENUM,
        values: ["Computing", "Non-Computing"],
        allowNull: false,
        defaultValue: "Computing",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "marking",
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "hostIP",
      {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "hostMAC",
      {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "hostGUID",
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "hostFQDN",
      {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "targetComment",
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "techArea",
      {
        type: DataTypes.ENUM,
        values: [
          "",
          "Application Review",
          "Boundary Security",
          "CDS Admin Review",
          "CDS Technical Review",
          "Database Review",
          "Domain Name System (DNS)",
          "Exchange Server",
          "Host Based System Security (HBSS)",
          "Internal Network",
          "Mobility",
          "Releasable Networks (REL)",
          "Releaseable Networks (REL)",
          "Traditional Security",
          "UNIX OS",
          "VVOIP Review",
          "Web Review",
          "Windows OS",
          "Other Review",
        ],
        allowNull: false,
        defaultValue: "",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "targetKey",
      {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "stigGUID",
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "webOrDatabase",
      {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "webDBSite",
      {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "Systems",
      "webDBInstance",
      {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      { transaction },
    );
  } catch (error) {
    console.log(error);
    await transaction.rollback();
  } finally {
    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query(`PRAGMA foreign_keys = ON;`);
    }
    await transaction.commit();
  }
};

export const down = async () => {
  try {
    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query(`PRAGMA foreign_keys = OFF;`);
      await sequelize.query(`
        CREATE TABLE "Systems_backup" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "hostName" TEXT, "BoundaryId" INTEGER REFERENCES "Boundaries" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
      `);
      await sequelize.query(`
        INSERT INTO "Systems_backup" 
        SELECT "id", "name", "lastUpdate", "creationDate", "hostName", "BoundaryId"
        FROM "Systems";
        `);
      await sequelize.query(`DROP TABLE "Systems";`);
      await sequelize.query(`
        CREATE TABLE "Systems" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "hostname" TEXT, "BoundaryId" INTEGER REFERENCES "Boundaries" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
      `);
      await sequelize.query(`
        INSERT INTO "Systems" 
        SELECT "id", "name", "lastUpdate", "creationDate", "hostname", "BoundaryId"
        FROM "Systems_backup";
        `);
      await sequelize.query(`DROP TABLE "Systems_backup";`);
    }
    if (sequelize.getDialect() === "postgres") {
      await sequelize.getQueryInterface().removeColumn("Systems", "role");
      await sequelize.getQueryInterface().removeColumn("Systems", "assetType");
      await sequelize.getQueryInterface().removeColumn("Systems", "marking");
      await sequelize.getQueryInterface().removeColumn("Systems", "hostIP");
      await sequelize.getQueryInterface().removeColumn("Systems", "hostMAC");
      await sequelize.getQueryInterface().removeColumn("Systems", "hostGUID");
      await sequelize.getQueryInterface().removeColumn("Systems", "hostFQDN");
      await sequelize.getQueryInterface().removeColumn("Systems", "targetComment");
      await sequelize.getQueryInterface().removeColumn("Systems", "techArea");
      await sequelize.getQueryInterface().removeColumn("Systems", "targetKey");
      await sequelize.getQueryInterface().removeColumn("Systems", "stigGUID");
      await sequelize.getQueryInterface().removeColumn("Systems", "webOrDatabase");
      await sequelize.getQueryInterface().removeColumn("Systems", "webDBSite");
      await sequelize.getQueryInterface().removeColumn("Systems", "webDBInstance");
      await sequelize.getQueryInterface().renameColumn("Systems", "hostname", "hostName");
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query(`PRAGMA foreign_keys = ON;`);
    }
  }
};

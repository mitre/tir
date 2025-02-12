import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug.js";

export const up = async () => {
  const transaction = await sequelize.transaction();
  try {
    if (sequelize.getDialect() === "postgres") {
      await sequelize
        .getQueryInterface()
        .renameColumn("AssessmentItems", "severity_override", "severityOverride", { transaction });
      await sequelize
        .getQueryInterface()
        .renameColumn(
          "AssessmentItems",
          "severity_justification",
          "severityOverrideJustification",
          { transaction },
        );
    }
    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query(`PRAGMA foreign_keys = OFF;`, { transaction });
      await sequelize.query(
        `
        CREATE TABLE "AssessmentItems_backup" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "status" TEXT NOT NULL, "finding_details" TEXT, "comments" TEXT, "severity_override" TEXT, "severity_justification" TEXT, "current" TINYINT(1) DEFAULT 1, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "previousId" INTEGER REFERENCES "AssessmentItems" ("id"), "AssessmentId" INTEGER REFERENCES "Assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "StigDatumId" INTEGER REFERENCES "StigData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)
        `,
        { transaction },
      );
      await sequelize.query(
        `
        INSERT INTO "AssessmentItems_backup"
        SELECT "id", "status", "finding_details", "comments", "severity_override", "severity_justification", "current", "lastUpdate", "creationDate", "previousId", "AssessmentId", "StigDatumId"
        FROM "AssessmentItems"
        `,
        { transaction },
      );
      await sequelize.query(`DROP TABLE "AssessmentItems";`, { transaction });
      await sequelize.query(
        `
        CREATE TABLE "AssessmentItems" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "status" TEXT NOT NULL, "finding_details" TEXT, "comments" TEXT, "severityOverride" TEXT, "severityOverrideJustification" TEXT, "current" TINYINT(1) DEFAULT 1, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "previousId" INTEGER REFERENCES "AssessmentItems" ("id"), "AssessmentId" INTEGER REFERENCES "Assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "StigDatumId" INTEGER REFERENCES "StigData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)
        `,
        { transaction },
      );
      await sequelize.query(
        `
        INSERT INTO "AssessmentItems"
        SELECT "id", "status", "finding_details", "comments", "severity_override", "severity_justification", "current", "lastUpdate", "creationDate", "previousId", "AssessmentId", "StigDatumId"
        FROM "AssessmentItems_backup"
        `,
        { transaction },
      );
      await sequelize.query(`DROP TABLE "AssessmentItems_backup";`, { transaction });
    }
    await sequelize.getQueryInterface().addColumn(
      "AssessmentItems",
      "statusOverride",
      {
        type: DataTypes.STRING,
        allowNull: true,
      },
      { transaction },
    );
    await sequelize.getQueryInterface().addColumn(
      "AssessmentItems",
      "statusOverrideJustification",
      {
        type: DataTypes.STRING,
        allowNull: true,
      },
      { transaction },
    );
    await transaction.commit();
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    throw error;
  }
};
export const down = async () => {
  const transaction = await sequelize.transaction();
  try {
    if (sequelize.getDialect() === "postgres") {
      await sequelize
        .getQueryInterface()
        .renameColumn("AssessmentItems", "severity_override", "severityOverride", { transaction });
      await sequelize
        .getQueryInterface()
        .renameColumn(
          "AssessmentItems",
          "severity_justification",
          "severityOverrideJustification",
          { transaction },
        );
    }
    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query(`PRAGMA foreign_keys = OFF;`, { transaction });
      await sequelize.query(
        `
        CREATE TABLE "AssessmentItems_backup" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "status" TEXT NOT NULL, "finding_details" TEXT, "comments" TEXT, "severityOverride" TEXT, "severityOverrideJustification" TEXT, "current" TINYINT(1) DEFAULT 1, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "previousId" INTEGER REFERENCES "AssessmentItems" ("id"), "AssessmentId" INTEGER REFERENCES "Assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "StigDatumId" INTEGER REFERENCES "StigData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)
        `,
        { transaction },
      );
      await sequelize.query(
        `
        INSERT INTO "AssessmentItems_backup"
        SELECT "id", "status", "finding_details", "comments", "severityOverride", "severityOverrideJustification", "current", "lastUpdate", "creationDate", "previousId", "AssessmentId", "StigDatumId"
        FROM "AssessmentItems"
        `,
        { transaction },
      );
      await sequelize.query(`DROP TABLE "AssessmentItems";`, { transaction });
      await sequelize.query(
        `
        CREATE TABLE "AssessmentItems" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "status" TEXT NOT NULL, "finding_details" TEXT, "comments" TEXT, "severity_override" TEXT, "severity_justification" TEXT, "current" TINYINT(1) DEFAULT 1, "lastUpdate" TEXT NOT NULL, "creationDate" TEXT NOT NULL, "previousId" INTEGER REFERENCES "AssessmentItems" ("id"), "AssessmentId" INTEGER REFERENCES "Assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "StigDatumId" INTEGER REFERENCES "StigData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)
        `,
        { transaction },
      );
      await sequelize.query(
        `
        INSERT INTO "AssessmentItems"
        SELECT "id", "status", "finding_details", "comments", "severityOverride", "severityOverrideJustification", "current", "lastUpdate", "creationDate", "previousId", "AssessmentId", "StigDatumId"
        FROM "AssessmentItems_backup"
        `,
        { transaction },
      );
      await sequelize.query(`DROP TABLE "AssessmentItems_backup";`, { transaction });
    }
    await transaction.commit();
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    throw error;
  }
};

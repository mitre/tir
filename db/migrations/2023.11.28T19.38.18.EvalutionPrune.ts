import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  if (sequelize.getDialect() === "postgres") {
    await sequelize.getQueryInterface().removeColumn("EvaluationItems", "status");
    await sequelize.getQueryInterface().removeColumn("EvaluationItems", "finding_details");
    await sequelize.getQueryInterface().removeColumn("EvaluationItems", "comments");
    await sequelize.getQueryInterface().removeColumn("EvaluationItems", "severity_override");
    await sequelize.getQueryInterface().removeColumn("EvaluationItems", "severity_justification");
    await sequelize.query('DROP TYPE IF EXISTS public."enum_EvaluationItems_severity_override";');
    await sequelize.query('DROP TYPE IF EXISTS public."enum_EvaluationItems_status";');
  } else {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS 'EvaluationItems_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'Office_Org' VARCHAR(256), 'Resources_Required' VARCHAR(256), 'Scheduled_Completion_Date' DATETIME, 'Milestone_Changes' VARCHAR(256), 'Poam_Comments' VARCHAR(1024), 'Mitigations' VARCHAR(256), 'Severity' TEXT, 'Relevance_of_Threat' TEXT, 'Likelihood' TEXT, 'Impact' TEXT, 'Impact_Description' VARCHAR(256), 'Residual_Risk_Level' TEXT, 'Recommendations' VARCHAR(256), 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `EvaluationItems_backup` SELECT `id`, `Office_Org`, `Resources_Required`, `Scheduled_Completion_Date`, `Milestone_Changes`, `Poam_Comments`, `Mitigations`, `Severity`, `Relevance_of_Threat`, `Likelihood`, `Impact`, `Impact_Description`, `Residual_Risk_Level`, `Recommendations`, `lastUpdate`, `creationDate`, `EvaluationId`, `StigDatumId` FROM `EvaluationItems`;",
    );
    await sequelize.query("DROP TABLE `EvaluationItems`;");
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS 'EvaluationItems' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'Office_Org' VARCHAR(256), 'Resources_Required' VARCHAR(256), 'Scheduled_Completion_Date' DATETIME, 'Milestone_Changes' VARCHAR(256), 'Poam_Comments' VARCHAR(1024), 'Mitigations' VARCHAR(256), 'Severity' TEXT, 'Relevance_of_Threat' TEXT, 'Likelihood' TEXT, 'Impact' TEXT, 'Impact_Description' VARCHAR(256), 'Residual_Risk_Level' TEXT, 'Recommendations' VARCHAR(256), 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `EvaluationItems` SELECT `id`, `Office_Org`, `Resources_Required`, `Scheduled_Completion_Date`, `Milestone_Changes`, `Poam_Comments`, `Mitigations`, `Severity`, `Relevance_of_Threat`, `Likelihood`, `Impact`, `Impact_Description`, `Residual_Risk_Level`, `Recommendations`, `lastUpdate`, `creationDate`, `EvaluationId`, `StigDatumId` FROM `EvaluationItems_backup`;",
    );
    await sequelize.query("DROP TABLE `EvaluationItems_backup`;");
  }
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().addColumn("EvaluationItems", "status", {
    type: DataTypes.ENUM,
    values: ["Not_Reviewed", "Open", "NotAFinding", "Not_Applicable", "Not_Set"],
    allowNull: false,
  });

  await sequelize.getQueryInterface().addColumn("EvaluationItems", "finding_details", {
    type: DataTypes.STRING,
  });

  await sequelize.getQueryInterface().addColumn("EvaluationItems", "comments", {
    type: DataTypes.STRING,
  });

  await sequelize.getQueryInterface().addColumn("EvaluationItems", "severity_override", {
    type: DataTypes.ENUM,
    values: ["high", "medium", "low"],
    allowNull: true,
  });

  await sequelize.getQueryInterface().addColumn("EvaluationItems", "severity_justification", {
    type: DataTypes.STRING,
  });
};

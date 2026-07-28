import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
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
      `CREATE TABLE IF NOT EXISTS 'EvaluationItems_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'Office_Org' TEXT, 'Resources_Required' TEXT, 'Scheduled_Completion_Date' DATETIME, 'Milestone_Changes' TEXT, 'Poam_Comments' TEXT, 'Mitigations' TEXT, 'Severity' TEXT, 'Relevance_of_Threat' TEXT, 'Likelihood' TEXT, 'Impact' TEXT, 'Impact_Description' TEXT, 'Residual_Risk_Level' TEXT, 'Recommendations' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL, 'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `EvaluationItems_backup` SELECT `id`, `Office_Org`, `Resources_Required`, `Scheduled_Completion_Date`, `Milestone_Changes`, `Poam_Comments`, `Mitigations`, `Severity`, `Relevance_of_Threat`, `Likelihood`, `Impact`, `Impact_Description`, `Residual_Risk_Level`, `Recommendations`, `lastUpdate`, `creationDate`, `EvaluationId`, `StigDatumId` FROM `EvaluationItems`;",
    );
    await sequelize.query("DROP TABLE `EvaluationItems`;");
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS 'EvaluationItems' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'Office_Org' TEXT, 'Resources_Required' TEXT, 'Scheduled_Completion_Date' DATETIME, 'Milestone_Changes' TEXT, 'Poam_Comments' TEXT, 'Mitigations' TEXT, 'Severity' TEXT, 'Relevance_of_Threat' TEXT, 'Likelihood' TEXT, 'Impact' TEXT, 'Impact_Description' TEXT, 'Residual_Risk_Level' TEXT, 'Recommendations' TEXT, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL, 'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE, 'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE);`,
    );
    await sequelize.query(
      "INSERT INTO `EvaluationItems` SELECT `id`, `Office_Org`, `Resources_Required`, `Scheduled_Completion_Date`, `Milestone_Changes`, `Poam_Comments`, `Mitigations`, `Severity`, `Relevance_of_Threat`, `Likelihood`, `Impact`, `Impact_Description`, `Residual_Risk_Level`, `Recommendations`, `lastUpdate`, `creationDate`, `EvaluationId`, `StigDatumId` FROM `EvaluationItems_backup`;",
    );
    await sequelize.query("DROP TABLE `EvaluationItems_backup`;");
  }
};
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn("EvaluationItems", "status", {
    type: DataTypes.ENUM,
    values: ["Not_Reviewed", "Open", "NotAFinding", "Not_Applicable", "Not_Set"],
    allowNull: false,
  });
  await sequelize.getQueryInterface().addColumn("EvaluationItems", "finding_details", {
    type: DataTypes.TEXT,
  });
  await sequelize.getQueryInterface().addColumn("EvaluationItems", "comments", {
    type: DataTypes.TEXT,
  });
  await sequelize.getQueryInterface().addColumn("EvaluationItems", "severity_override", {
    type: DataTypes.ENUM,
    values: ["high", "medium", "low"],
    allowNull: true,
  });
  await sequelize.getQueryInterface().addColumn("EvaluationItems", "severity_justification", {
    type: DataTypes.TEXT,
  });
};

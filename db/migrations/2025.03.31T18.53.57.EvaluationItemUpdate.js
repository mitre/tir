
export const up = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  const dialect = sequelize.getDialect();
  const transaction = await sequelize.transaction();

  try {
    if (dialect === "sqlite") {
      await sequelize.query(
        `CREATE TABLE IF NOT EXISTS 'EvaluationItems_backup' (
          'id' INTEGER PRIMARY KEY AUTOINCREMENT,
          'Office_Org' TEXT,
          'Resources_Required' TEXT,
          'Scheduled_Completion_Date' TEXT,
          'Milestone_Changes' TEXT,
          'Poam_Comments' TEXT,
          'Mitigations' TEXT,
          'Severity' TEXT,
          'Relevance_of_Threat' TEXT,
          'Likelihood' TEXT,
          'Impact' TEXT,
          'Impact_Description' TEXT,
          'Residual_Risk_Level' TEXT,
          'Recommendations' TEXT,
          'lastUpdate' TEXT NOT NULL,
          'creationDate' TEXT NOT NULL,
          'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE,
          'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        { transaction },
      );

      await sequelize.query(
        `INSERT INTO 'EvaluationItems_backup' SELECT
          id, Office_Org, Resources_Required, Scheduled_Completion_Date,
          Milestone_Changes, Poam_Comments, Mitigations, Severity,
          Relevance_of_Threat, Likelihood, Impact, Impact_Description,
          Residual_Risk_Level, Recommendations, lastUpdate, creationDate,
          EvaluationId, StigDatumId
         FROM EvaluationItems;`,
        { transaction },
      );

      await sequelize.query(`DROP TABLE EvaluationItems;`, { transaction });

      await sequelize.query(
        `CREATE TABLE IF NOT EXISTS 'EvaluationItems' (
          'id' INTEGER PRIMARY KEY AUTOINCREMENT,
          'Office_Org' TEXT,
          'Resources_Required' TEXT,
          'Scheduled_Completion_Date' TEXT,
          'Milestone_Changes' TEXT,
          'Poam_Comments' TEXT,
          'Mitigations' TEXT,
          'Severity' TEXT,
          'Relevance_of_Threat' TEXT,
          'Likelihood' TEXT,
          'Impact' TEXT,
          'Impact_Description' TEXT,
          'Residual_Risk_Level' TEXT,
          'Recommendations' TEXT,
          'lastUpdate' TEXT NOT NULL,
          'creationDate' TEXT NOT NULL,
          'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE,
          'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        { transaction },
      );

      await sequelize.query(
        `INSERT INTO EvaluationItems SELECT
          id, Office_Org, Resources_Required, Scheduled_Completion_Date,
          Milestone_Changes, Poam_Comments, Mitigations, Severity,
          Relevance_of_Threat, Likelihood, Impact, Impact_Description,
          Residual_Risk_Level, Recommendations, lastUpdate, creationDate,
          EvaluationId, StigDatumId
         FROM EvaluationItems_backup;`,
        { transaction },
      );

      await sequelize.query(`DROP TABLE EvaluationItems_backup;`, { transaction });
    } else {
      await queryInterface.changeColumn(
        "EvaluationItems",
        "Scheduled_Completion_Date",
        {
          type: "TEXT",
        },
        { transaction },
      );

      const textCols = [
        "Office_Org",
        "Resources_Required",
        "Milestone_Changes",
        "Poam_Comments",
        "Mitigations",
        "Impact_Description",
        "Recommendations",
        "lastUpdate",
        "creationDate",
      ];

      for (const col of textCols) {
        await queryInterface.changeColumn(
          "EvaluationItems",
          col,
          { type: "TEXT" },
          { transaction },
        );
      }
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const down = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  const dialect = sequelize.getDialect();
  const transaction = await sequelize.transaction();

  try {
    if (dialect === "sqlite") {
      await sequelize.query(
        `CREATE TABLE IF NOT EXISTS 'EvaluationItems_backup' (
          'id' INTEGER PRIMARY KEY AUTOINCREMENT,
          'Office_Org' TEXT,
          'Resources_Required' TEXT,
          'Scheduled_Completion_Date' DATETIME,
          'Milestone_Changes' TEXT,
          'Poam_Comments' TEXT,
          'Mitigations' TEXT,
          'Severity' TEXT,
          'Relevance_of_Threat' TEXT,
          'Likelihood' TEXT,
          'Impact' TEXT,
          'Impact_Description' TEXT,
          'Residual_Risk_Level' TEXT,
          'Recommendations' TEXT,
          'lastUpdate' TEXT NOT NULL,
          'creationDate' TEXT NOT NULL,
          'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE,
          'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        { transaction },
      );

      await sequelize.query(
        `INSERT INTO EvaluationItems_backup SELECT
          id, Office_Org, Resources_Required, Scheduled_Completion_Date,
          Milestone_Changes, Poam_Comments, Mitigations, Severity,
          Relevance_of_Threat, Likelihood, Impact, Impact_Description,
          Residual_Risk_Level, Recommendations, lastUpdate, creationDate,
          EvaluationId, StigDatumId
         FROM EvaluationItems;`,
        { transaction },
      );

      await sequelize.query(`DROP TABLE EvaluationItems;`, { transaction });

      await sequelize.query(
        `CREATE TABLE IF NOT EXISTS 'EvaluationItems' (
          'id' INTEGER PRIMARY KEY AUTOINCREMENT,
          'Office_Org' TEXT,
          'Resources_Required' TEXT,
          'Scheduled_Completion_Date' DATETIME,
          'Milestone_Changes' TEXT,
          'Poam_Comments' TEXT,
          'Mitigations' TEXT,
          'Severity' TEXT,
          'Relevance_of_Threat' TEXT,
          'Likelihood' TEXT,
          'Impact' TEXT,
          'Impact_Description' TEXT,
          'Residual_Risk_Level' TEXT,
          'Recommendations' TEXT,
          'lastUpdate' TEXT NOT NULL,
          'creationDate' TEXT NOT NULL,
          'EvaluationId' INTEGER REFERENCES 'Evaluations' ('id') ON DELETE CASCADE ON UPDATE CASCADE,
          'StigDatumId' INTEGER REFERENCES 'StigData' ('id') ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        { transaction },
      );

      await sequelize.query(
        `INSERT INTO EvaluationItems SELECT
          id, Office_Org, Resources_Required, Scheduled_Completion_Date,
          Milestone_Changes, Poam_Comments, Mitigations, Severity,
          Relevance_of_Threat, Likelihood, Impact, Impact_Description,
          Residual_Risk_Level, Recommendations, lastUpdate, creationDate,
          EvaluationId, StigDatumId
         FROM EvaluationItems_backup;`,
        { transaction },
      );

      await sequelize.query(`DROP TABLE EvaluationItems_backup;`, { transaction });
    } else {
      await queryInterface.changeColumn(
        "EvaluationItems",
        "Scheduled_Completion_Date",
        {
          type: "TEXT",
        },
        { transaction },
      );

      const textCols = [
        "Office_Org",
        "Resources_Required",
        "Milestone_Changes",
        "Poam_Comments",
        "Mitigations",
        "Impact_Description",
        "Recommendations",
        "lastUpdate",
        "creationDate",
      ];

      for (const col of textCols) {
        await queryInterface.changeColumn(
          "EvaluationItems",
          col,
          { type: "TEXT" },
          { transaction },
        );
      }
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

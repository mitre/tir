import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  const upMigration = await sequelize.transaction();
  try {
    await sequelize.getQueryInterface().createTable(
      "ComplianceStatuses",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        status: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "ImplementationStatuses",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        status: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "CommonControlProviders",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        provider: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "SecurityControlDesignations",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        designation: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "TestMethods",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        method: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "FrequencyTypes",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        frequency: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "ConMonMethods",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        method: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "RiskLevels",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        level: { type: DataTypes.TEXT, allowNull: false },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "ControlRecords",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        BoundaryId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Boundaries",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ControlFamilyId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ControlFamilies",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ControlRevisionId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ControlRevisions",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );

    // Main Table
    await sequelize.getQueryInterface().createTable(
      "ControlRecordItems",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlRecordId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ControlRecords",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ControlId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Controls",
            key: "id",
          },
        },
        ControlEnhancementId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ControlEnhancements",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ComplianceStatusId: {
          type: DataTypes.INTEGER,
          references: { model: "ComplianceStatuses", key: "id" },
        },
        ImplementationStatusId: {
          type: DataTypes.INTEGER,
          references: { model: "ImplementationStatuses", key: "id" },
        },
        CommonControlProviderId: {
          type: DataTypes.INTEGER,
          references: { model: "CommonControlProviders", key: "id" },
        },
        systemProvider: { type: DataTypes.TEXT },
        SecurityControlDesignationId: {
          type: DataTypes.INTEGER,
          references: { model: "SecurityControlDesignations", key: "id" },
        },
        TestMethodId: {
          type: DataTypes.INTEGER,
          references: { model: "TestMethods", key: "id" },
        },
        naJustification: { type: DataTypes.TEXT },
        estimatedCompletionDate: { type: DataTypes.TEXT },
        implementationNarrative: { type: DataTypes.TEXT },
        responsibleEntities: { type: DataTypes.TEXT },
        criticality: { type: DataTypes.TEXT },
        FrequencyTypeId: {
          type: DataTypes.INTEGER,
          references: { model: "FrequencyTypes", key: "id" },
        },
        ConMonMethodId: {
          type: DataTypes.INTEGER,
          references: { model: "ConMonMethods", key: "id" },
        },
        reporting: { type: DataTypes.TEXT },
        tracking: { type: DataTypes.TEXT },
        conmonComments: { type: DataTypes.TEXT },
        SeverityId: { type: DataTypes.INTEGER, references: { model: "RiskLevels", key: "id" } },
        RelevanceOfThreatId: {
          type: DataTypes.INTEGER,
          references: { model: "RiskLevels", key: "id" },
        },
        LikelihoodId: { type: DataTypes.INTEGER, references: { model: "RiskLevels", key: "id" } },
        ImpactId: { type: DataTypes.INTEGER, references: { model: "RiskLevels", key: "id" } },
        ResidualRiskLevelId: {
          type: DataTypes.INTEGER,
          references: { model: "RiskLevels", key: "id" },
        },
        vulnerabilitySummary: { type: DataTypes.TEXT },
        mitigations: { type: DataTypes.TEXT },
        impactDescription: { type: DataTypes.TEXT },
        recommendations: { type: DataTypes.TEXT },
        auditor: { type: DataTypes.TEXT },
        AuditControlStatusId: {
          type: DataTypes.INTEGER,
          references: { model: "ComplianceStatuses", key: "id" },
        },
        auditDate: { type: DataTypes.TEXT },
        auditComments: { type: DataTypes.TEXT },
        assessor: { type: DataTypes.TEXT },
        AssessorControlStatusId: {
          type: DataTypes.INTEGER,
          references: { model: "ComplianceStatuses", key: "id" },
        },
        assessorDate: { type: DataTypes.TEXT },
        assessorComments: { type: DataTypes.TEXT },
        lastUpdate: { type: DataTypes.TEXT, allowNull: false },
        creationDate: { type: DataTypes.TEXT, allowNull: false },
      },
      { transaction: upMigration },
    );
    await upMigration.commit();
  } catch (error) {
    await upMigration.rollback();
    throw error;
  }
};

export const down = async () => {
  const downMigration = await sequelize.transaction();
  try {
    await sequelize.getQueryInterface().dropTable("ControlRecordItems", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlRecords", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("RiskLevels", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ConMonMethods", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("FrequencyTypes", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("TestMethods", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("SecurityControlDesignations", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("CommonControlProviders", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ImplementationStatuses", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ComplianceStatuses", {
      transaction: downMigration,
    });
    await downMigration.commit();
  } catch (error) {
    await downMigration.rollback();
    throw error;
  }
};

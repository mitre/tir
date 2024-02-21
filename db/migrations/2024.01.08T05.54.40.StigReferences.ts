import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  if (sequelize.getDialect() === "sqlite") {
    await sequelize.query(
      `CREATE TABLE 'StigData_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' VARCHAR(255) NOT NULL, 'group_title' VARCHAR(255) NOT NULL, 'description' VARCHAR(255) NOT NULL, 'rule_id' VARCHAR(255) NOT NULL UNIQUE, 'severity' TEXT, 'weight' VARCHAR(255) NOT NULL, 'rule_ver' VARCHAR(255) NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' VARCHAR(255), 'false_negatives' VARCHAR(255), 'documentable' VARCHAR(255) NOT NULL, 'mitigations' VARCHAR(255), 'security_override_guidance' TEXT, 'potential_impact' VARCHAR(255), 'third_party_tools' VARCHAR(255), 'mitigation_control' VARCHAR(255), 'responsibility' VARCHAR(255), 'ia_controls' VARCHAR(255), 'check__system' VARCHAR(255) NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' VARCHAR(255) NOT NULL, 'check_check_content_ref__href' VARCHAR(255) NOT NULL, 'fix__id' VARCHAR(255) NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' VARCHAR(255) NOT NULL, 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL);`,
    );
    await sequelize.query(
      "INSERT INTO `StigData_backup` SELECT `id`, `vuln_num`, `group_title`, `description`, `rule_id`, `severity`, `weight`, `rule_ver`, `rule_title`, `vuln_discuss`, `false_positives`, `false_negatives`, `documentable`, `mitigations`, `security_override_guidance`, `potential_impact`, `third_party_tools`, `mitigation_control`, `responsibility`, `ia_controls`, `check__system`, `check_check_content`, `check_check_content_ref__name`, `check_check_content_ref__href`, `fix__id`, `fixtext`, `fixtext__fixref`, `lastUpdate`, `creationDate` FROM `StigData`;",
    );
    await sequelize.query("DROP TABLE `StigData`;");
    await sequelize.query(
      `CREATE TABLE 'StigData' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' VARCHAR(255) NOT NULL, 'group_title' VARCHAR(255) NOT NULL, 'description' VARCHAR(255) NOT NULL, 'rule_id' VARCHAR(255) NOT NULL UNIQUE, 'severity' TEXT, 'weight' VARCHAR(255) NOT NULL, 'rule_ver' VARCHAR(255) NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' VARCHAR(255), 'false_negatives' VARCHAR(255), 'documentable' VARCHAR(255) NOT NULL, 'mitigations' VARCHAR(255), 'security_override_guidance' TEXT, 'potential_impact' VARCHAR(255), 'third_party_tools' VARCHAR(255), 'mitigation_control' VARCHAR(255), 'responsibility' VARCHAR(255), 'ia_controls' VARCHAR(255), 'check__system' VARCHAR(255) NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' VARCHAR(255) NOT NULL, 'check_check_content_ref__href' VARCHAR(255) NOT NULL, 'fix__id' VARCHAR(255) NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' VARCHAR(255) NOT NULL, 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL);`,
    );
    await sequelize.query(
      "INSERT INTO `StigData` SELECT `id`, `vuln_num`, `group_title`, `description`, `rule_id`, `severity`, `weight`, `rule_ver`, `rule_title`, `vuln_discuss`, `false_positives`, `false_negatives`, `documentable`, `mitigations`, `security_override_guidance`, `potential_impact`, `third_party_tools`, `mitigation_control`, `responsibility`, `ia_controls`, `check__system`, `check_check_content`, `check_check_content_ref__name`, `check_check_content_ref__href`, `fix__id`, `fixtext`, `fixtext__fixref`, `lastUpdate`, `creationDate` FROM `StigData_backup`;",
    );
    await sequelize.query("DROP TABLE `StigData_backup`;");
  } else {
    await sequelize.getQueryInterface().removeColumn("StigData", "reference__dc_identifier");
    await sequelize.getQueryInterface().removeColumn("StigData", "reference__dc_publisher");
    await sequelize.getQueryInterface().removeColumn("StigData", "reference__dc_subject");
    await sequelize.getQueryInterface().removeColumn("StigData", "reference__dc_title");
    await sequelize.getQueryInterface().removeColumn("StigData", "reference__dc_type");
  }

  await sequelize.getQueryInterface().createTable("StigReferences", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    dc_identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_publisher: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_type: {
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
  });

  await sequelize.getQueryInterface().createTable("StigData_StigReferences", {
    StigReferenceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "StigReferences",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    StigDatumId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "StigData",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};

export const down: MigrationFn = async () => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_identifier", {
      type: DataTypes.STRING,
    });

    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_publisher", {
      type: DataTypes.STRING,
    });

    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_subject", {
      type: DataTypes.STRING,
    });

    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_title", {
      type: DataTypes.STRING,
    });

    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_type", {
      type: DataTypes.STRING,
    });
  } else {
    await sequelize.query(
      `CREATE TABLE 'StigData_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' VARCHAR(255) NOT NULL, 'group_title' VARCHAR(255) NOT NULL, 'description' VARCHAR(255) NOT NULL, 'rule_id' VARCHAR(255) NOT NULL UNIQUE, 'severity' TEXT, 'weight' VARCHAR(255) NOT NULL, 'rule_ver' VARCHAR(255) NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' VARCHAR(255), 'false_negatives' VARCHAR(255), 'documentable' VARCHAR(255) NOT NULL, 'mitigations' VARCHAR(255), 'security_override_guidance' TEXT, 'potential_impact' VARCHAR(255), 'third_party_tools' VARCHAR(255), 'mitigation_control' VARCHAR(255), 'responsibility' VARCHAR(255), 'ia_controls' VARCHAR(255), 'check__system' VARCHAR(255) NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' VARCHAR(255) NOT NULL, 'check_check_content_ref__href' VARCHAR(255) NOT NULL, 'fix__id' VARCHAR(255) NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' VARCHAR(255) NOT NULL , 'reference__dc_identifier' VARCHAR(255) NOT NULL DEFAULT "", 'reference__dc_publisher' VARCHAR(255) NOT NULL DEFAULT "", 'reference__dc_subject' VARCHAR(255) NOT NULL DEFAULT "", 'reference__dc_title' VARCHAR(255) NOT NULL DEFAULT "", 'reference__dc_type' VARCHAR(255) NOT NULL DEFAULT "", 'lastUpdate' VARCHAR${DATETIME_LENGTH} NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL);`,
    );
    await sequelize.query(
      "INSERT INTO `StigData_backup` SELECT `id`, `vuln_num`, `group_title`, `description`, `rule_id`, `severity`, `weight`, `rule_ver`, `rule_title`, `vuln_discuss`, `false_positives`, `false_negatives`, `documentable`, `mitigations`, `security_override_guidance`, `potential_impact`, `third_party_tools`, `mitigation_control`, `responsibility`, `ia_controls`, `check__system`, `check_check_content`, `check_check_content_ref__name`, `check_check_content_ref__href`, `fix__id`, `fixtext`, `fixtext__fixref`, '', '', '', '', '', `lastUpdate`, `creationDate` FROM `StigData`;",
    );
    await sequelize.query("DROP TABLE `StigData`;");
    await sequelize.query(
      `CREATE TABLE 'StigData' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' VARCHAR(255) NOT NULL, 'group_title' VARCHAR(255) NOT NULL, 'description' VARCHAR(255) NOT NULL, 'rule_id' VARCHAR(255) NOT NULL UNIQUE, 'severity' TEXT, 'weight' VARCHAR(255) NOT NULL, 'rule_ver' VARCHAR(255) NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' VARCHAR(255), 'false_negatives' VARCHAR(255), 'documentable' VARCHAR(255) NOT NULL, 'mitigations' VARCHAR(255), 'security_override_guidance' TEXT, 'potential_impact' VARCHAR(255), 'third_party_tools' VARCHAR(255), 'mitigation_control' VARCHAR(255), 'responsibility' VARCHAR(255), 'ia_controls' VARCHAR(255), 'check__system' VARCHAR(255) NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' VARCHAR(255) NOT NULL, 'check_check_content_ref__href' VARCHAR(255) NOT NULL, 'fix__id' VARCHAR(255) NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' VARCHAR(255) NOT NULL, 'reference__dc_identifier' VARCHAR(255) NOT NULL, 'reference__dc_publisher' VARCHAR(255) NOT NULL, 'reference__dc_subject' VARCHAR(255) NOT NULL, 'reference__dc_title' VARCHAR(255) NOT NULL, 'reference__dc_type' VARCHAR(255) NOT NULL, 'lastUpdate' VARCHAR(${DATETIME_LENGTH}) NOT NULL, 'creationDate' VARCHAR(${DATETIME_LENGTH}) NOT NULL);`,
    );
    await sequelize.query(
      "INSERT INTO `StigData` SELECT `id`, `vuln_num`, `group_title`, `description`, `rule_id`, `severity`, `weight`, `rule_ver`, `rule_title`, `vuln_discuss`, `false_positives`, `false_negatives`, `documentable`, `mitigations`, `security_override_guidance`, `potential_impact`, `third_party_tools`, `mitigation_control`, `responsibility`, `ia_controls`, `check__system`, `check_check_content`, `check_check_content_ref__name`, `check_check_content_ref__href`, `fix__id`, `fixtext`, `fixtext__fixref`, `reference__dc_identifier`, `reference__dc_publisher`, `reference__dc_subject`, `reference__dc_title`, `reference__dc_type`, `lastUpdate`, `creationDate` FROM `StigData_backup`;",
    );
    await sequelize.query("DROP TABLE `StigData_backup`;");
  }

  await sequelize.getQueryInterface().dropTable("StigReferences");
  await sequelize.getQueryInterface().dropTable("StigData_StigReferences");
};

import { DataTypes } from "sequelize";

import { sequelize } from "../umzug.js";
export const up = async () => {
  if (sequelize.getDialect() === "sqlite") {
    await sequelize.query(
      `CREATE TABLE 'StigData_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' TEXT NOT NULL, 'group_title' TEXT NOT NULL, 'description' TEXT NOT NULL, 'rule_id' TEXT NOT NULL UNIQUE, 'severity' TEXT, 'weight' TEXT NOT NULL, 'rule_ver' TEXT NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' TEXT, 'false_negatives' TEXT, 'documentable' TEXT NOT NULL, 'mitigations' TEXT, 'security_override_guidance' TEXT, 'potential_impact' TEXT, 'third_party_tools' TEXT, 'mitigation_control' TEXT, 'responsibility' TEXT, 'ia_controls' TEXT, 'check__system' TEXT NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' TEXT NOT NULL, 'check_check_content_ref__href' TEXT NOT NULL, 'fix__id' TEXT NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' TEXT NOT NULL, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);`,
    );
    await sequelize.query(
      "INSERT INTO `StigData_backup` SELECT `id`, `vuln_num`, `group_title`, `description`, `rule_id`, `severity`, `weight`, `rule_ver`, `rule_title`, `vuln_discuss`, `false_positives`, `false_negatives`, `documentable`, `mitigations`, `security_override_guidance`, `potential_impact`, `third_party_tools`, `mitigation_control`, `responsibility`, `ia_controls`, `check__system`, `check_check_content`, `check_check_content_ref__name`, `check_check_content_ref__href`, `fix__id`, `fixtext`, `fixtext__fixref`, `lastUpdate`, `creationDate` FROM `StigData`;",
    );
    await sequelize.query("DROP TABLE `StigData`;");
    await sequelize.query(
      `CREATE TABLE 'StigData' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' TEXT NOT NULL, 'group_title' TEXT NOT NULL, 'description' TEXT NOT NULL, 'rule_id' TEXT NOT NULL UNIQUE, 'severity' TEXT, 'weight' TEXT NOT NULL, 'rule_ver' TEXT NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' TEXT, 'false_negatives' TEXT, 'documentable' TEXT NOT NULL, 'mitigations' TEXT, 'security_override_guidance' TEXT, 'potential_impact' TEXT, 'third_party_tools' TEXT, 'mitigation_control' TEXT, 'responsibility' TEXT, 'ia_controls' TEXT, 'check__system' TEXT NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' TEXT NOT NULL, 'check_check_content_ref__href' TEXT NOT NULL, 'fix__id' TEXT NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' TEXT NOT NULL, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);`,
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dc_publisher: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dc_subject: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dc_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dc_type: {
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
export const down = async () => {
  if (sequelize.getDialect() !== "sqlite") {
    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_identifier", {
      type: DataTypes.TEXT,
    });
    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_publisher", {
      type: DataTypes.TEXT,
    });
    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_subject", {
      type: DataTypes.TEXT,
    });
    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_title", {
      type: DataTypes.TEXT,
    });
    await sequelize.getQueryInterface().addColumn("StigData", "reference__dc_type", {
      type: DataTypes.TEXT,
    });
  } else {
    await sequelize.query(
      `CREATE TABLE 'StigData_backup' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' TEXT NOT NULL, 'group_title' TEXT NOT NULL, 'description' TEXT NOT NULL, 'rule_id' TEXT NOT NULL UNIQUE, 'severity' TEXT, 'weight' TEXT NOT NULL, 'rule_ver' TEXT NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' TEXT, 'false_negatives' TEXT, 'documentable' TEXT NOT NULL, 'mitigations' TEXT, 'security_override_guidance' TEXT, 'potential_impact' TEXT, 'third_party_tools' TEXT, 'mitigation_control' TEXT, 'responsibility' TEXT, 'ia_controls' TEXT, 'check__system' TEXT NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' TEXT NOT NULL, 'check_check_content_ref__href' TEXT NOT NULL, 'fix__id' TEXT NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' TEXT NOT NULL , 'reference__dc_identifier' TEXT NOT NULL DEFAULT "", 'reference__dc_publisher' TEXT NOT NULL DEFAULT "", 'reference__dc_subject' TEXT NOT NULL DEFAULT "", 'reference__dc_title' TEXT NOT NULL DEFAULT "", 'reference__dc_type' TEXT NOT NULL DEFAULT "", 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);`,
    );
    await sequelize.query(
      "INSERT INTO `StigData_backup` SELECT `id`, `vuln_num`, `group_title`, `description`, `rule_id`, `severity`, `weight`, `rule_ver`, `rule_title`, `vuln_discuss`, `false_positives`, `false_negatives`, `documentable`, `mitigations`, `security_override_guidance`, `potential_impact`, `third_party_tools`, `mitigation_control`, `responsibility`, `ia_controls`, `check__system`, `check_check_content`, `check_check_content_ref__name`, `check_check_content_ref__href`, `fix__id`, `fixtext`, `fixtext__fixref`, '', '', '', '', '', `lastUpdate`, `creationDate` FROM `StigData`;",
    );
    await sequelize.query("DROP TABLE `StigData`;");
    await sequelize.query(
      `CREATE TABLE 'StigData' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'vuln_num' TEXT NOT NULL, 'group_title' TEXT NOT NULL, 'description' TEXT NOT NULL, 'rule_id' TEXT NOT NULL UNIQUE, 'severity' TEXT, 'weight' TEXT NOT NULL, 'rule_ver' TEXT NOT NULL, 'rule_title' TEXT NOT NULL, 'vuln_discuss' TEXT NOT NULL, 'false_positives' TEXT, 'false_negatives' TEXT, 'documentable' TEXT NOT NULL, 'mitigations' TEXT, 'security_override_guidance' TEXT, 'potential_impact' TEXT, 'third_party_tools' TEXT, 'mitigation_control' TEXT, 'responsibility' TEXT, 'ia_controls' TEXT, 'check__system' TEXT NOT NULL, 'check_check_content' TEXT NOT NULL, 'check_check_content_ref__name' TEXT NOT NULL, 'check_check_content_ref__href' TEXT NOT NULL, 'fix__id' TEXT NOT NULL, 'fixtext' TEXT NOT NULL, 'fixtext__fixref' TEXT NOT NULL, 'reference__dc_identifier' TEXT NOT NULL, 'reference__dc_publisher' TEXT NOT NULL, 'reference__dc_subject' TEXT NOT NULL, 'reference__dc_title' TEXT NOT NULL, 'reference__dc_type' TEXT NOT NULL, 'lastUpdate' TEXT NOT NULL, 'creationDate' TEXT NOT NULL);`,
    );
    await sequelize.query(
      "INSERT INTO `StigData` SELECT `id`, `vuln_num`, `group_title`, `description`, `rule_id`, `severity`, `weight`, `rule_ver`, `rule_title`, `vuln_discuss`, `false_positives`, `false_negatives`, `documentable`, `mitigations`, `security_override_guidance`, `potential_impact`, `third_party_tools`, `mitigation_control`, `responsibility`, `ia_controls`, `check__system`, `check_check_content`, `check_check_content_ref__name`, `check_check_content_ref__href`, `fix__id`, `fixtext`, `fixtext__fixref`, `reference__dc_identifier`, `reference__dc_publisher`, `reference__dc_subject`, `reference__dc_title`, `reference__dc_type`, `lastUpdate`, `creationDate` FROM `StigData_backup`;",
    );
    await sequelize.query("DROP TABLE `StigData_backup`;");
  }
  await sequelize.getQueryInterface().dropTable("StigReferences");
  await sequelize.getQueryInterface().dropTable("StigData_StigReferences");
};

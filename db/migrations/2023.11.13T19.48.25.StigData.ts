import type { MigrationFn } from "umzug";
import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug";

export const up: MigrationFn = async () => {
  await sequelize.getQueryInterface().createTable("StigData", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vuln_num: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    group_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rule_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    severity: {
      type: DataTypes.ENUM,
      values: ["high", "medium", "low"],
      allowNull: true,
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rule_ver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rule_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    vuln_discuss: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    false_positives: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    false_negatives: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentable: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mitigations: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    security_override_guidance: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    potential_impact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    third_party_tools: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mitigation_control: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    responsibility: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ia_controls: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    check__system: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    check_check_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    check_check_content_ref__name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    check_check_content_ref__href: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fix__id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fixtext: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fixtext__fixref: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference__dc_identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference__dc_publisher: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference__dc_subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference__dc_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference__dc_type: {
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

  await sequelize.getQueryInterface().createTable("Stig_StigData", {
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
    StigId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Stigs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};

export const down: MigrationFn = async () => {
  await sequelize.getQueryInterface().dropTable("StigData");
  await sequelize.getQueryInterface().dropTable("Stig_StigData");
};

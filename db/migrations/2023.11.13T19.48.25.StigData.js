import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";
export const up = async () => {
  await sequelize.getQueryInterface().createTable("StigData", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vuln_num: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    group_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rule_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    severity: {
      type: DataTypes.ENUM,
      values: ["high", "medium", "low"],
      allowNull: true,
    },
    weight: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rule_ver: {
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
      allowNull: true,
    },
    false_negatives: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documentable: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mitigations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    security_override_guidance: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    potential_impact: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    third_party_tools: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mitigation_control: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responsibility: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ia_controls: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    check__system: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    check_check_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    check_check_content_ref__name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    check_check_content_ref__href: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fix__id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fixtext: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fixtext__fixref: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reference__dc_identifier: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reference__dc_publisher: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reference__dc_subject: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reference__dc_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reference__dc_type: {
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
export const down = async () => {
  await sequelize.getQueryInterface().dropTable("StigData");
  await sequelize.getQueryInterface().dropTable("Stig_StigData");
};

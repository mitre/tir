import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("Cves", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cveId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cvss3AttackComplexity: {
      type: DataTypes.ENUM,
      values: ["LOW", "HIGH"],
    },
    cvss3AttackVector: {
      type: DataTypes.ENUM,
      values: ["NETWORK", "ADJACENT_NETWORK", "LOCAL", "PHYSICAL"],
    },
    cvss3AvailabilityImpact: {
      type: DataTypes.ENUM,
      values: ["NONE", "LOW", "HIGH"],
    },
    cvss3ConfidentialityImpact: {
      type: DataTypes.ENUM,
      values: ["NONE", "LOW", "HIGH"],
    },
    cvss3IntegrityImpact: {
      type: DataTypes.ENUM,
      values: ["NONE", "LOW", "HIGH"],
    },
    cvss3PrivilegesRequired: {
      type: DataTypes.ENUM,
      values: ["NONE", "LOW", "HIGH"],
    },
    cvss3Scope: {
      type: DataTypes.ENUM,
      values: ["UNCHANGED", "CHANGED"],
    },
    cvss3UserInteraction: {
      type: DataTypes.ENUM,
      values: ["NONE", "REQUIRED"],
    },
    cvss3Version: {
      type: DataTypes.STRING,
    },
    // cvss3BaseSeverity: {
    //   type: DataTypes.ENUM,
    //   values: ["local", "remote", "mixed"],
    //   allowNull: false,
    // },
    // "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N",
    // cvss3_base_score: {
    //   type: DataTypes.INTEGER,
    // },
    // cvss3_vector: {
    //   type: DataTypes.STRING,
    // },
    // cvssV3_impactScore: {
    //   type: DataTypes.INTEGER,
    // },
    // cvss_base_score: {
    //   type: DataTypes.INTEGER,
    // },
    // cvss_vector: {
    //   type: DataTypes.STRING,
    // },
    lastUpdate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  await sequelize.getQueryInterface().createTable("Cve_Systems", {
    CveId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Cves",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    SystemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Systems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("Cve_Systems");
  await sequelize.getQueryInterface().dropTable("Cves");
  if (sequelize.getDialect() === "postgres") {
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3AttackComplexity";`);
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3AttackVector";`);
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3AvailabilityImpact";`);
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3ConfidentialityImpact";`);
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3IntegrityImpact";`);
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3PrivilegesRequired";`);
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3Scope";`);
    await sequelize.query(`DROP TYPE IF EXISTS "enum_Cves_cvss3UserInteraction";`);
  }
};

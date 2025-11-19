/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  Association,
} from "sequelize";
import { Control } from "./controls";
import { ControlRecord } from "./controlRecord";
import { ComplianceStatus } from "./complianceStatus";
import { ControlEnhancement } from "./controlEnhancement";
import { ImplementationStatus } from "./implementationStatus";
import { CommonControlProvider } from "./commonControlProvider";
import { SecurityControlDesignation } from "./securityControlDesignation";
import { TestMethod } from "./testMethod";
import { FrequencyType } from "./frequencyType";
import { ConMonMethod } from "./conMonMethod";
import { RiskLevel } from "./riskLevel";

export class ControlRecordItem extends Model<
  InferAttributes<ControlRecordItem>,
  InferCreationAttributes<ControlRecordItem>
> {
  declare id: CreationOptional<number>;
  declare ControlId: number;
  declare ControlEnhancementId?: number;
  declare ControlRecordId: number;
  declare ComplianceStatusId?: number;
  declare ImplementationStatusId?: number;
  declare CommonControlProviderId?: number;
  declare systemProvider?: string;
  declare SecurityControlDesignationId?: number;
  declare TestMethodId?: number;
  declare naJustification?: string;
  declare estimatedCompletionDate?: string;
  declare implementationNarrative?: string;
  declare responsibleEntities?: string;
  declare criticality?: string;
  declare FrequencyTypeId?: number;
  declare ConMonMethodId?: number;
  declare reporting?: string;
  declare tracking?: string;
  declare conmonComments?: string;
  declare SeverityId?: number;
  declare RelevanceOfThreatId?: number;
  declare LikelihoodId?: number;
  declare ImpactId?: number;
  declare ResidualRiskLevelId?: number;
  declare vulnerabilitySummary?: string;
  declare mitigations?: string;
  declare impactDescription?: string;
  declare recommendations?: string;
  declare auditor?: string;
  declare AuditControlStatusId?: number;
  declare auditDate?: string;
  declare auditComments?: string;
  declare assessor?: string;
  declare AssessorControlStatusId?: number;
  declare assessorDate?: string;
  declare assessorComments?: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare Control?: NonAttribute<Control>;
  declare ComplianceStatus?: NonAttribute<ComplianceStatus>;
  declare ControlEnhancement?: NonAttribute<ControlEnhancement>;
  declare ControlRecord?: NonAttribute<ControlRecord>;

  declare static associations: {
    Control: Association<ControlRecordItem, Control>;
    ComplianceStatus: Association<ControlRecordItem, ComplianceStatus>;
    ControlEnhancement: Association<ControlRecordItem, ControlEnhancement>;
    ControlRecord: Association<ControlRecordItem, ControlRecord>;
  };
}

ControlRecordItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ControlRecordId: {
      type: DataTypes.INTEGER,
      references: {
        model: ControlRecord,
        key: "id",
      },
    },
    ControlId: {
      type: DataTypes.INTEGER,
      references: {
        model: Control,
        key: "id",
      },
    },
    ControlEnhancementId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ControlEnhancement,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    ComplianceStatusId: {
      type: DataTypes.INTEGER,
      references: {
        model: ComplianceStatus,
        key: "id",
      },
    },
    ImplementationStatusId: {
      type: DataTypes.INTEGER,
      references: {
        model: ImplementationStatus,
        key: "id",
      },
    },
    CommonControlProviderId: {
      type: DataTypes.INTEGER,
      references: {
        model: CommonControlProvider,
        key: "id",
      },
    },
    systemProvider: {
      type: DataTypes.TEXT,
    },
    SecurityControlDesignationId: {
      type: DataTypes.INTEGER,
      references: {
        model: SecurityControlDesignation,
        key: "id",
      },
    },
    TestMethodId: {
      type: DataTypes.INTEGER,
      references: {
        model: TestMethod,
        key: "id",
      },
    },
    naJustification: {
      type: DataTypes.TEXT,
    },
    estimatedCompletionDate: {
      type: DataTypes.TEXT,
    },
    implementationNarrative: {
      type: DataTypes.TEXT,
    },
    responsibleEntities: {
      type: DataTypes.TEXT,
    },
    criticality: {
      type: DataTypes.TEXT,
    },
    FrequencyTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: FrequencyType,
        key: "id",
      },
    },
    ConMonMethodId: {
      type: DataTypes.INTEGER,
      references: {
        model: ConMonMethod,
        key: "id",
      },
    },
    reporting: {
      type: DataTypes.TEXT,
    },
    tracking: {
      type: DataTypes.TEXT,
    },
    conmonComments: {
      type: DataTypes.TEXT,
    },
    SeverityId: {
      type: DataTypes.INTEGER,
      references: {
        model: RiskLevel,
        key: "id",
      },
    },
    RelevanceOfThreatId: {
      type: DataTypes.INTEGER,
      references: {
        model: RiskLevel,
        key: "id",
      },
    },
    LikelihoodId: {
      type: DataTypes.INTEGER,
      references: {
        model: RiskLevel,
        key: "id",
      },
    },
    ImpactId: {
      type: DataTypes.INTEGER,
      references: {
        model: RiskLevel,
        key: "id",
      },
    },
    ResidualRiskLevelId: {
      type: DataTypes.INTEGER,
      references: {
        model: RiskLevel,
        key: "id",
      },
    },
    vulnerabilitySummary: {
      type: DataTypes.TEXT,
    },
    mitigations: {
      type: DataTypes.TEXT,
    },
    impactDescription: {
      type: DataTypes.TEXT,
    },
    recommendations: {
      type: DataTypes.TEXT,
    },
    auditor: {
      type: DataTypes.TEXT,
    },
    AuditControlStatusId: {
      type: DataTypes.INTEGER,
      references: {
        model: ComplianceStatus,
        key: "id",
      },
    },
    auditDate: {
      type: DataTypes.TEXT,
    },
    auditComments: {
      type: DataTypes.TEXT,
    },
    assessor: {
      type: DataTypes.TEXT,
    },
    AssessorControlStatusId: {
      type: DataTypes.INTEGER,
      references: {
        model: ComplianceStatus,
        key: "id",
      },
    },
    assessorDate: {
      type: DataTypes.TEXT,
    },
    assessorComments: {
      type: DataTypes.TEXT,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ControlRecordItem",
    timestamps: false,
  },
);

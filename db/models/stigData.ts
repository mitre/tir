/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  NonAttribute,
  Association,
} from "sequelize";

import { AssessmentItem } from "./assessmentItem";
import { Stig } from "./stig";
import { StigIdent } from "./stigIdent";
import { EvaluationItem } from "./evaluationItem";
import type { Override } from ".";

export class StigData extends Model<InferAttributes<StigData>, InferCreationAttributes<StigData>> {
  declare id: CreationOptional<number>;
  declare vuln_num: string;
  declare group_title: string;
  declare description: string;
  declare rule_id: string;
  declare severity: string;
  declare weight: string;
  declare rule_ver: string;
  declare rule_title: string;
  declare vuln_discuss: string;
  declare false_positives: string;
  declare false_negatives: string;
  declare documentable: string;
  declare mitigations: string;
  declare security_override_guidance: string;
  declare potential_impact: string;
  declare third_party_tools: string;
  declare mitigation_control: string;
  declare responsibility: string;
  declare ia_controls: string;
  declare check__system: string;
  declare check_check_content: string;
  declare check_check_content_ref__name: string;
  declare check_check_content_ref__href: string;
  declare fix__id: string;
  declare fixtext: string;
  declare fixtext__fixref: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare AssessmentItems?: NonAttribute<AssessmentItem[]>;
  declare EvaluationItems?: NonAttribute<EvaluationItem[]>;

  // declare SystemId: ForeignKey<System["id"]>;
  // declare StigDatumId: ForeignKey<StigData["id"]>;

  declare Stigs?: NonAttribute<Stig[]>;
  // declare SystemId: ForeignKey<System["id"]>;
  // declare StigDatumId: ForeignKey<StigData["id"]>;
  declare StigIdents?: NonAttribute<StigIdent[]>;
  declare Overrides?: NonAttribute<Override[]>;

  declare static associations: {
    AssessmentItems: Association<StigData, AssessmentItem>;
    //   StigDatumId: Association<Override, StigData>;
    Stigs: Association<StigData, Stig>;
    StigIdents: Association<StigData, StigIdent>;
    EvaluationItmes: Association<StigData, EvaluationItem>;
    Overrides: Association<StigData, Override>;
  };
}

StigData.init(
  {
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
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "StigData",
    timestamps: false,
  },
);

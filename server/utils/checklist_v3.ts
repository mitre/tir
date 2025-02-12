import * as fs from "fs";
import { parseStringPromise } from "xml2js";
import Mustache from "mustache";
import { parseXml, XMLDocument } from "libxmljs";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import {
  Assessment,
  AssessmentItem,
  Boundary,
  Classification,
  Stig,
  StigData,
  StigIdent,
  StigReference,
  StigResponsibility,
  System,
  SystemInterface,
  Override,
} from "../../db/models";
import { findOrCreateAssessment } from "./assessments";
import { findStigByStigId } from "./stigLibrary";

type ChecklistV3 = {
  stigs: CklStigV3[];
  target_data: CklTargetDataV3;
  title: string; // this is the title of the saved CKL(B)
  active: boolean; // Internal use by SV3
  cklb_version: string; // keep in line with released schema version (default "1.0")
  has_path: boolean; // Internal use by SV3
  id: string; // needs to be generated
  mode: number; // Internal use by SV3
};

type CklTargetDataV3 = {
  classification: string | null;
  comments: string; // <TARGET_COMMENT> in V2
  fqdn: string; // <HOST_FQDN> in V2
  tir_name: string;
  host_name: string;
  ip_address: string; // <HOST_IP> in V2
  is_web_database: boolean; // <WEB_OR_DATABASE> in V2
  mac_address: string; // <HOST_MAC> in V2
  role: string; // <ROLE> in V2
  target_type: string; // <ASSET_TYPE> in V2
  technology_area: string; // <TECH_AREA> in V2
  web_db_instance: string; // <WEB_DB_INSTANCE> in V2
  web_db_site: string; // <WEB_DB_SITE> in V2
};

type CklStigV3 = {
  rules: CklStigRuleV3[];
  size: number;
  stig_id: string;
  stig_name: string;
  uuid: string; // V2 SI_DATA SID_NAME uuid
};

type CklStigRuleV3 = {
  ccis: string[];
  check_content: string;
  check_content_ref: CklCheckContentRefV3;
  classification: string;
  comments: string;
  discussion: string;
  documentable: string;
  false_negatives: string;
  false_positives: string;
  finding_details: string;
  fix_text: string;
  group_id: string;
  group_id_src: string;
  group_title: string;
  group_tree: GroupTreeRefV3[];
  ia_controls: string;
  legacy_ids: string[];
  mitigation_control: string;
  mitigations: string;
  overrides: { [property: string]: string };
  potential_impacts: string;
  reference_identifier: string;
  responsibility: string;
  rule_id: string;
  rule_id_src: string;
  rule_title: string;
  rule_version: string;
  security_override_guidance: string;
  severity: string;
  status: string;
  stig_uuid: string;
  third_party_tools: string;
  uuid: string;
  weight: string;
};

type CklCheckContentRefV3 = {
  href: string;
  name: string;
};

type GroupTreeRefV3 = {
  description: string;
  id: string;
  title: string;
};

// Converts Checklist Status field to Checklist V3 Status enumeration
function convertToV3Status(oldStatus: string): string {
  switch (oldStatus) {
    case "Not_Reviewed": {
      return "not_reviewed";
    }
    case "NotAFinding": {
      return "not_a_finding";
    }
    case "Open": {
      return "open";
    }
    case "Not_Applicable": {
      return "not_applicable";
    }
    default: {
      return "not_reviewed";
    }
  }
}

// Converts Checklist Status field From V3 cklb format to Checklist V2 Status enumeration
export function convertToV2Status(oldStatus: string): string {
  switch (oldStatus) {
    case "not_reviewed": {
      return "Not_Reviewed"
    }
    case "not_a_finding": {
      return "NotAFinding"
    }
    case "open": {
      return "Open"
    }
    case "not_applicable": {
      return "Not_Applicable"
    }
    default: {
      return "Not_Reviewed"
    }
  }
}

// Accepts system array (for a boundary) and flag true if we return only one (1) stig per checklist and returns list of V3 checklist types
export async function convertToCKL3(
  systemData: System[],
  oneStigPerChecklist: string | null,
): Promise<ChecklistV3[]> {
  const cklDataV3: ChecklistV3[] = [];
  let singleStig: boolean = false;
  if (oneStigPerChecklist != null) {
    singleStig = oneStigPerChecklist.toLowerCase() === "true";
  }

  try {
    // For each system, build a v3 checklist
    for (const system of systemData) {
      const thisSystem = await System.findOne({
        where: { id: system.id },
        include: [
          {
            model: Boundary,
            include: [{ model: Classification }],
          },
          {
            model: Assessment,
            where: { succeededByAssessmentId: { [Op.is]: null } },
            include: [
              {
                model: Stig,
              },
              {
                model: AssessmentItem,
                include: [
                  {
                    model: StigData,
                    include: [
                      { model: StigIdent },
                      { model: StigResponsibility },
                      { model: StigReference },
                      { model: Override },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      /// stigList used for many-to-one stig-to-checklist relationship
      const stigList: CklStigV3[] = [];
      if (thisSystem != null && thisSystem.Assessments != null) {
        for (const assessment of thisSystem.Assessments) {
          const ruleList: CklStigRuleV3[] = [];
          const STIGUUID = uuidv4();
          for (const ai of assessment.AssessmentItems) {
            // Build Rules
            const ruleCCIs: string[] = [];
            const legacyList: string[] = [];

            if (ai.StigDatum != null && ai.StigDatum.StigIdents != null) {
              for (const stigIdent of ai.StigDatum.StigIdents) {
                if (stigIdent.text.startsWith("CCI-")) {
                  ruleCCIs.push(stigIdent.text);
                } else if (stigIdent.system.endsWith("legacy")) {
                  legacyList.push(stigIdent.text);
                }
              }
              const checkRef: CklCheckContentRefV3 = {
                href: ai.StigDatum.check_check_content_ref__href,
                name: ai.StigDatum.check_check_content_ref__name,
              };

              const groupTree: GroupTreeRefV3[] = [];
              groupTree.push({
                description: ai.StigDatum.description,
                id: ai.StigDatum.vuln_num,
                title: ai.StigDatum.group_title,
              });

              const currentOverride: { [property: string]: { [property: string]: string } } = {};
              if (ai.severityOverride != null && ai.severityOverride != "") {
                const overrideContent: { [property: string]: string } = {};
                overrideContent["severity"] = ai.severityOverride;
                overrideContent["reason"] = ai.severityOverrideJustification;
                currentOverride["severity"] = overrideContent;
              }
              // Use Severity Override
              if (ai.StigDatum.Overrides != null) {
                for (const thisOverride of ai.StigDatum.Overrides) {
                  if (thisOverride.status != "" && thisOverride.SystemId == thisSystem.id) {
                    const overrideContent: { [property: string]: string } = {};
                    overrideContent["status"] = thisOverride.status;
                    overrideContent["reason"] = "TBD";
                    currentOverride["status"] = overrideContent;
                  }
                }
              }

              let stigRefId: string = "";
              if (ai.StigDatum.StigReferences != null && ai.StigDatum.StigReferences.length > 0) {
                stigRefId = ai.StigDatum.StigReferences[0].id.toString();
              }

              const thisRuleId = ai.StigDatum.rule_id.replace("_rule", "");

              // build rule
              const thisRule: CklStigRuleV3 = {
                ccis: ruleCCIs,
                check_content: ai.StigDatum.check_check_content,
                check_content_ref: checkRef,
                classification: assessment.classification,
                comments: ai.comments,
                discussion: ai.StigDatum.vuln_discuss,
                false_negatives: ai.StigDatum.false_negatives,
                false_positives: ai.StigDatum.false_positives,
                finding_details: ai.finding_details,
                fix_text: ai.StigDatum.fixtext,
                group_id: ai.StigDatum.group_title, // TODO
                group_id_src: ai.StigDatum.group_title, // TODO
                group_title: ai.StigDatum.group_title,
                group_tree: groupTree,
                ia_controls: ai.StigDatum.ia_controls,
                legacy_ids: legacyList,
                mitigation_control: ai.StigDatum.mitigation_control,
                mitigations: ai.StigDatum.mitigations,
                overrides: currentOverride,
                potential_impacts: ai.StigDatum.potential_impact,
                reference_identifier: stigRefId,
                responsibility: ai.StigDatum.responsibility,
                rule_id: thisRuleId,
                rule_id_src: ai.StigDatum.rule_id,
                rule_title: ai.StigDatum.rule_title,
                rule_version: ai.StigDatum.rule_ver,
                security_override_guidance: ai.StigDatum.security_override_guidance,
                severity: ai.StigDatum.severity,
                status: convertToV3Status(ai.status),
                stig_uuid: STIGUUID,
                third_party_tools: ai.StigDatum.third_party_tools,
                uuid: ai.StigDatumId?.toString() || "",
                weight: ai.StigDatum.weight,
              };
              ruleList.push(thisRule);
            }
          }

          const thisSTIG: CklStigV3 = {
            rules: ruleList,
            size: assessment.AssessmentItems?.length || 0,
            stig_id: assessment.Stig?.stigid || "",
            stig_name: assessment.Stig?.title || "",
            uuid: STIGUUID,
          };

          if (singleStig) {
            const singleCKLUUID = uuidv4();
            const stigSingle: CklStigV3[] = [];
            const thisTarget: CklTargetDataV3 = {
              classification: system.Boundary?.Classification?.abbreviation || "CUI",
              comments: system.targetComment,
              fqdn: system.name,
              tir_name: system.name,
              host_name: system.hostName,
              ip_address: system.hostIP,
              is_web_database: system.webOrDatabase,
              mac_address: system.hostMAC,
              role: system.role,
              target_type: system.assetType,
              technology_area: system.techArea,
              web_db_instance: system.webDBInstance,
              web_db_site: system.webDBSite,
            };
            stigSingle.push(thisSTIG);
            const currentCKL: ChecklistV3 = {
              stigs: stigSingle,
              target_data: thisTarget,
              title: thisSTIG.stig_name,
              active: true,
              cklb_version: "1.0",
              has_path: false,
              id: singleCKLUUID,
              mode: 1,
            };
            cklDataV3.push(currentCKL);
          } else {
            stigList.push(thisSTIG);
          }
        }

        if (!singleStig) {
          const thisTarget: CklTargetDataV3 = {
            classification: system.Boundary?.Classification?.abbreviation || "CUI",
            comments: system.targetComment,
            fqdn: system.name,
            tir_name: system.name,
            host_name: system.hostName,
            ip_address: system.hostIP,
            is_web_database: system.webOrDatabase,
            mac_address: system.hostMAC,
            role: system.role,
            target_type: system.assetType,
            technology_area: system.techArea,
            web_db_instance: system.webDBInstance,
            web_db_site: system.webDBSite,
          };
          const CKLUUID = uuidv4(); // Generate for each ckl
          const currentCKL: ChecklistV3 = {
            stigs: stigList,
            target_data: thisTarget,
            title: system.name,
            active: true,
            cklb_version: "1.0",
            has_path: false,
            id: CKLUUID,
            mode: 1,
          };

          cklDataV3.push(currentCKL);
        }
      }
    }
  } catch (error) {
    logger.error(error);
    console.log(error);
  }
  return cklDataV3;
}

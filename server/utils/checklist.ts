import * as fs from "fs";
import { parseStringPromise } from "xml2js";
import Mustache from "mustache";
import { v4 as uuidv4 } from "uuid";
import { parseXml, XMLDocument } from "libxmljs";
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
} from "../../db/models";
import { findOrCreateAssessment } from "./assessments";
import { findStigByStigId } from "./stigLibrary";

export async function importChecklist(
  xmlData: string,
  systemId: number,
): Promise<{ error: boolean; new: boolean }> {
  const jsonObj = await parseStringPromise(xmlData, { explicitArray: false });

  const system = (await System.findByPk(systemId, {
    include: {
      model: Boundary,
    },
  })) as SystemInterface;

  const stigLibraryId = system?.dataValues.Boundary.StigLibraryId;

  let stigArrayFromCkl = jsonObj.CHECKLIST.STIGS.iSTIG;

  if (!Array.isArray(stigArrayFromCkl)) {
    stigArrayFromCkl = [stigArrayFromCkl];
  }

  try {
    for (const stigFromCkl of stigArrayFromCkl) {
      const cklStigId = getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "stigid");

      if (!cklStigId) {
        throw new Error("No matching Stig for checklist found.");
      }

      const stigMatchingCkl = await findStigByStigId(cklStigId, stigLibraryId);

      if (!stigMatchingCkl) {
        throw createError({
          statusCode: 415,
          statusMessage: `No STIG matching id "${cklStigId}" found in system's assigned Library`,
        });
      }

      const alreadyHasStig = await system.hasStig(stigMatchingCkl.dataValues.id);
      if (!alreadyHasStig) {
        await system.addStig(stigMatchingCkl?.dataValues.id);
      }

      let assessmentToPopulate: Assessment;
      const previousAssessment = await Assessment.findOne({
        where: {
          SystemId: systemId,
          StigId: stigMatchingCkl?.dataValues.id,
        },
      });

      if (previousAssessment) {
        assessmentToPopulate = previousAssessment;
      } else {
        const newAssessment = await findOrCreateAssessment(
          systemId,
          stigMatchingCkl?.dataValues.id,
          getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "classification") || "",
          getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "customname") || "",
          getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "uuid") || "",
        );

        assessmentToPopulate = newAssessment;
      }

      const stigChecks = await StigData.findAll({
        include: [
          {
            model: Stig,
            where: { id: stigMatchingCkl?.dataValues.id },
          },
        ],
      });

      for (const cklVulnElement of stigFromCkl.VULN) {
        const vulnNum = vNumFromElement(cklVulnElement);
        const stigDatum = stigChecks.find((sd) => sd.vuln_num === vulnNum);

        if (stigDatum) {
          const [assessmentItem] = await AssessmentItem.findOrBuild({
            where: {
              AssessmentId: assessmentToPopulate.dataValues.id,
              StigDatumId: stigDatum.id,
            },
          });

          assessmentItem.setDataValue("status", cklVulnElement?.STATUS);
          assessmentItem.setDataValue("comments", cklVulnElement?.COMMENTS);
          assessmentItem.setDataValue("finding_details", cklVulnElement?.FINDING_DETAILS);
          assessmentItem.setDataValue(
            "severity_override",
            cklVulnElement?.SEVERITY_OVERRIDE === "" ? null : cklVulnElement?.SEVERITY_OVERRIDE,
          );
          assessmentItem.setDataValue(
            "severity_justification",
            cklVulnElement?.SEVERITY_JUSTIFICATION,
          );

          try {
            await assessmentItem.save();
          } catch (error) {
            logger.error(
              `Error saving AssessmentItem: ${assessmentItem.id},StigId: ${cklStigId},V-Key: ${vulnNum}`,
            );
          }
        } else {
          logger.error(`Unable to find matching VKey for StigId: ${cklStigId},V-Key: ${vulnNum}`);
        }
      }
    }
    return { error: false, new: true };
  } catch (error) {
    logger.error(error);
    console.log(error);
    return { error: true, new: false };
  }
}

type SI_DATA = {
  SID_NAME: string;
  SID_DATA: string;
};

export function getSI_DataByName(array: SI_DATA[], name: string): string | null {
  if (!Array.isArray(array)) {
    array = [array];
  }
  const item = array.find((element) => element.SID_NAME && element.SID_NAME === name);
  return item ? item.SID_DATA : null;
}

type Stig_Data = {
  VULN_ATTRIBUTE: string;
  ATTRIBUTE_DATA: string;
}[];

type VulnElement = {
  STIG_DATA: Stig_Data;
  COMMENTS: string;
  FINDING_DETAILS: string;
  SEVERITY_JUSTIFICATION: string;
  SEVERITY_OVERRIDE: string;
  STATUS: string;
};

function findVulnElementByvNum(array: VulnElement[], vNum: string): VulnElement | null {
  const result = array.find((vulnElement) => {
    return vulnElement.STIG_DATA.some((data) => {
      return data.VULN_ATTRIBUTE === "Vuln_Num" && data.ATTRIBUTE_DATA === vNum;
    });
  });

  return result || null;
}

function vNumFromElement(vulnElement: VulnElement): string | undefined {
  const vulnNumData = vulnElement.STIG_DATA.find((data) => data.VULN_ATTRIBUTE === "Vuln_Num");
  return vulnNumData ? vulnNumData.ATTRIBUTE_DATA : undefined;
}

type CklStigInfo = {
  sid_name: string;
  sid_data: string;
};

type CklStigData = {
  vuln_attribute: string;
  attribute_data: string;
};

type CklVuln = {
  stig_data: CklStigData[];
  status: string;
  findingDetails: string;
  comments: string;
  severityOverride: string;
  OverrideJustification: string;
};

type CklStig = {
  sidata: CklStigInfo[];
  vulns: CklVuln[];
};

type ChecklistData = {
  role: string;
  asset_type: string;
  marking: string;
  host_name: string;
  host_ip: string;
  host_mac: string;
  host_fqdn: string;
  target_comment: string;
  tech_area: string;
  target_key: string;
  web_or_database: boolean;
  stigs: CklStig[];
};

export async function buildCklString<T extends boolean>(
  systemId: number,
  singleStigPerCkl: T,
): Promise<T extends true ? string[] : string> {
  const system = await System.findOne({
    where: { id: systemId },
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
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!system) {
    return "" as T extends true ? string[] : string;
  }

  const template = fs.readFileSync("lib/template/checklistv2.xml", "utf8");

  const cklStrings = [];
  let cklString = "";

  const cklData: ChecklistData = {
    role: "None",
    asset_type: "Computing",
    marking: system?.Boundary?.Classification?.abbreviation || "CUI",
    host_name: system?.name || "",
    host_ip: "",
    host_mac: "",
    host_fqdn: "",
    target_comment: "",
    tech_area: "",
    target_key: "",
    web_or_database: false,
    stigs: [],
  };

  const cklStigs = [];

  for (const assessment of system.Assessments ?? []) {
    const cklUUID = uuidv4();
    const cklStigInfo: CklStigInfo[] = [
      { sid_name: "version", sid_data: assessment.Stig?.version || "" },
      { sid_name: "classification", sid_data: assessment.classification },
      { sid_name: "customname", sid_data: assessment.customname },
      { sid_name: "stigid", sid_data: assessment.Stig?.stigid || "" },
      { sid_name: "description", sid_data: assessment.Stig?.description || "" },
      { sid_name: "filename", sid_data: assessment.Stig?.filename || "" },
      { sid_name: "releaseinfo", sid_data: assessment.Stig?.plain_text__release_info || "" },
      { sid_name: "title", sid_data: assessment.Stig?.title || "" },
      { sid_name: "uuid", sid_data: assessment.uuid || cklUUID },
      { sid_name: "notice", sid_data: assessment.Stig?.notice__id || "" },
      { sid_name: "source", sid_data: assessment.Stig?.reference__source || "" },
    ];

    const cklVulns: CklVuln[] = [];

    if (assessment.AssessmentItems) {
      const stigUUID = uuidv4();
      for (const assessmentItem of assessment.AssessmentItems) {
        const dbStigData = assessmentItem.StigDatum;
        let cklStigData: CklStigData[] = [];
        if (dbStigData) {
          cklStigData = [
            { vuln_attribute: "Vuln_Num", attribute_data: dbStigData?.vuln_num },
            { vuln_attribute: "Severity", attribute_data: dbStigData?.severity },
            { vuln_attribute: "Group_Title", attribute_data: dbStigData?.group_title },
            { vuln_attribute: "Rule_ID", attribute_data: dbStigData?.rule_id },
            { vuln_attribute: "Rule_Ver", attribute_data: dbStigData?.rule_ver },
            { vuln_attribute: "Rule_Title", attribute_data: dbStigData?.rule_title },
            { vuln_attribute: "Vuln_Discuss", attribute_data: dbStigData?.vuln_discuss },
            { vuln_attribute: "IA_Controls", attribute_data: dbStigData?.ia_controls },
            { vuln_attribute: "Check_Content", attribute_data: dbStigData?.check_check_content },
            { vuln_attribute: "Fix_Text", attribute_data: dbStigData?.fixtext },
            { vuln_attribute: "False_Positives", attribute_data: dbStigData?.false_positives },
            { vuln_attribute: "False_Negatives", attribute_data: dbStigData?.false_negatives },
            { vuln_attribute: "Documentable", attribute_data: dbStigData?.documentable },
            { vuln_attribute: "Mitigations", attribute_data: dbStigData?.mitigations },
            { vuln_attribute: "Potential_Impact", attribute_data: dbStigData?.potential_impact },
            { vuln_attribute: "Third_Party_Tools", attribute_data: dbStigData?.third_party_tools },
            {
              vuln_attribute: "Mitigation_Control",
              attribute_data: dbStigData?.mitigation_control,
            },
            {
              vuln_attribute: "Security_Override_Guidance",
              attribute_data: dbStigData?.security_override_guidance,
            },
            {
              vuln_attribute: "Check_Content_Ref",
              attribute_data: dbStigData?.check_check_content_ref__name,
            },
            { vuln_attribute: "Weight", attribute_data: dbStigData?.weight },
            { vuln_attribute: "Class", attribute_data: "UNCLASS" },
            {
              vuln_attribute: "STIGRef",
              attribute_data: `${assessment.Stig?.title} :: Version ${assessment?.Stig?.version}, ${assessment?.Stig?.plain_text__release_info}`,
            },
            {
              vuln_attribute: "TargetKey",
              attribute_data: dbStigData?.StigReferences?.[0]?.dc_identifier || "",
            },
            { vuln_attribute: "STIG_UUID", attribute_data: stigUUID },
          ];

          if (dbStigData.StigResponsibilities) {
            for (const responsibility of dbStigData.StigResponsibilities) {
              cklStigData.push({
                vuln_attribute: "Responsibility",
                attribute_data: responsibility.name,
              });
            }
          }

          if (dbStigData.StigIdents) {
            for (const ident of dbStigData.StigIdents) {
              let name = "";
              if (ident.system.toLowerCase().endsWith("legacy")) {
                name = "LEGACY_ID";
              }
              if (ident.system.toLowerCase().endsWith("cci")) {
                name = "CCI_REF";
              }

              cklStigData.push({ vuln_attribute: name, attribute_data: ident.text });
            }
          }
        }

        cklVulns.push({
          stig_data: cklStigData,
          status: assessmentItem.status,
          findingDetails: assessmentItem.finding_details,
          comments: assessmentItem.comments,
          severityOverride: assessmentItem.severity_override,
          OverrideJustification: assessmentItem.severity_justification,
        });
      }
    }

    const cklStig = {
      sidata: cklStigInfo,
      vulns: cklVulns,
    };

    if (singleStigPerCkl) {
      cklData.stigs = [cklStig];
      cklStrings.push(Mustache.render(template, cklData));
    } else {
      cklStigs.push(cklStig);
      cklData.stigs = cklStigs;
    }
  }

  if (singleStigPerCkl) {
    return cklStrings as T extends true ? string[] : string;
  } else {
    cklString = Mustache.render(template, cklData);
    return cklString as T extends true ? string[] : string;
  }
}

export const verifyCkl2 = (
  xmlData: string,
): { result: boolean; error: boolean; errormsg: string } => {
  const xsdData = fs.readFileSync("./lib/schema/U_Checklist_Schema_V2.xsd", "utf8");
  let xmlDoc;
  try {
    xmlDoc = parseXml(xmlData);
  } catch (error) {
    return { result: false, error: true, errormsg: `Error parsing XML` };
  }

  const xsdDoc: XMLDocument = parseXml(xsdData, { baseUrl: "./lib/schema/" });

  try {
    const validationResult = xmlDoc.validate(xsdDoc);

    if (typeof validationResult === "boolean") {
      if (validationResult) {
        return { result: true, error: false, errormsg: "" };
      } else {
        xmlDoc.validationErrors.forEach((error: any) => logger.error(error));
        return { result: false, error: false, errormsg: "" };
      }
    }
    logger.error("Unkown result from cci list validation.", { validationResult });
  } catch (error) {
    logger.error(error);
    return { result: false, error: true, errormsg: "Error attempting xml validation" };
  }

  return { result: false, error: true, errormsg: "Unknown result from validation." };
};

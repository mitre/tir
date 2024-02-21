import { parseStringPromise } from "xml2js";
import { ValidationError } from "sequelize";
import {
  Stig,
  StigInterface,
  StigData,
  StigDataInterface,
  StigResponsibility,
  StigReference,
  StigIdent,
  StigIdentInterface,
} from "../../db/models";
import { hashObj } from "./hash";

export async function parseStigData(
  stigGroupObj: any,
  stig: StigInterface,
): Promise<{ newStigData: StigData; error: boolean }> {
  const hash = hashObj(stigGroupObj);

  const [newStigData, created] = (await StigData.findOrBuild({
    where: { rule_id: stigGroupObj.Rule.$["id"] },
  })) as [StigDataInterface, boolean];

  if (created) {
    // console.log("No match found.  Creating new stig data:", stigGroupObj.Rule.$["id"]);
    logger.debug(`No match found.  Creating new stig data: ${stigGroupObj.Rule.$["id"]}`);
  } else {
    // console.log("Match Found:", stigGroupObj.Rule.$["id"]);
    logger.debug(`Match Found: ${stigGroupObj.Rule.$["id"]}`);
  }

  const ruleDescriptionString = "<root>" + stigGroupObj.Rule.description + "</root>";
  const sanitizedRuleDescriptionString = sanitizeTextWithinTags(
    ["VulnDiscussion", "SeverityOverrideGuidance"],
    ruleDescriptionString,
  );
  let ruleDescription;
  try {
    ruleDescription = await parseStringPromise(sanitizedRuleDescriptionString, {
      explicitArray: false,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error parsing StigData from STIG: ${stig.dataValues.filename}`, {
        StigData: ruleDescriptionString,
        Error: error.message,
      });
    } else {
      logger.error("Unknown error:", error);
    }
  }

  if (created) {
    try {
      // console.log("Parsing:", stigGroupObj.Rule.$["id"]);
      logger.debug(`Parsing: ${stigGroupObj.Rule.$["id"]}`);
      parseStigDataObj(stigGroupObj, newStigData); // can throw errors reference undefine
      parseRuleDescription(ruleDescription, newStigData);

      // console.log("Saving", stigGroupObj.Rule.$["id"]);
      logger.debug(`Saving ${stigGroupObj.Rule.$["id"]}`);
      await newStigData.save();

      await stig.addStigData(newStigData);

      await associateResponsibility(ruleDescription, newStigData);
      await associateReference(stigGroupObj.Rule.reference, newStigData);
      await associateIdent(stigGroupObj.Rule.ident, newStigData);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.error(
          `Error Saving StigData ${newStigData.dataValues.vuln_num} from ${stig.dataValues.title}`,
          {
            Error: error.message,
            ErrorDetails: error.original.stack,
          },
        );
        console.error(`Error saving stigData in ${stig.dataValues.title}`);
      } else {
        console.log(
          `Error parsing svkey ${stigGroupObj.Rule.$["id"]} in stig ${stig.dataValues.title}`,
        );
        logger.error(
          `Error parsing svkey ${stigGroupObj.Rule.$["id"]} in stig ${stig.dataValues.title}`,
        );
      }
    }
  }

  return { newStigData, error: false };
}

async function parseStigDataObj(stigGroupObj: any, newStigData: StigData) {
  newStigData.dataValues.vuln_num = stigGroupObj.$["id"];
  newStigData.dataValues.group_title = stigGroupObj.title;
  newStigData.dataValues.description = stigGroupObj.description;
  newStigData.dataValues.rule_id = stigGroupObj.Rule.$["id"];
  newStigData.dataValues.severity = stigGroupObj.Rule.$["severity"];
  newStigData.dataValues.weight = stigGroupObj.Rule.$["weight"];
  newStigData.dataValues.rule_ver = stigGroupObj.Rule.version;
  newStigData.dataValues.rule_title = stigGroupObj.Rule.title;

  newStigData.dataValues.check__system = stigGroupObj.Rule.check.$["system"];
  newStigData.dataValues.check_check_content = stigGroupObj.Rule.check["check-content"];
  newStigData.dataValues.check_check_content_ref__name =
    stigGroupObj.Rule.check["check-content-ref"].$["name"];
  newStigData.dataValues.check_check_content_ref__href =
    stigGroupObj.Rule.check["check-content-ref"].$["href"];
  newStigData.dataValues.fix__id = stigGroupObj.Rule.fix.$["id"];
  newStigData.dataValues.fixtext = stigGroupObj.Rule.fixtext._;
  newStigData.dataValues.fixtext__fixref = stigGroupObj.Rule.fixtext.$["fixref"];
  newStigData.dataValues.reference__dc_identifier = stigGroupObj.Rule.reference["dc:identifier"];
  newStigData.dataValues.reference__dc_publisher = stigGroupObj.Rule.reference["dc:publisher"];
  newStigData.dataValues.reference__dc_subject = stigGroupObj.Rule.reference["dc:subject"];
  newStigData.dataValues.reference__dc_title = stigGroupObj.Rule.reference["dc:title"];
  newStigData.dataValues.reference__dc_type = stigGroupObj.Rule.reference["dc:type"];
}

async function parseRuleDescription(ruleDescription: any, newStigData: StigData) {
  newStigData.dataValues.vuln_discuss = ruleDescription.root.VulnDiscussion;
  newStigData.dataValues.false_positives = ruleDescription.root.FalsePositives;
  newStigData.dataValues.false_negatives = ruleDescription.root.FalseNegatives;
  newStigData.dataValues.documentable = ruleDescription.root.Documentable;
  newStigData.dataValues.mitigations = ruleDescription.root.Mitigations;
  newStigData.dataValues.security_override_guidance = ruleDescription.root.SeverityOverrideGuidance;
  newStigData.dataValues.potential_impact = ruleDescription.root.PotentialImpacts;
  newStigData.dataValues.third_party_tools = ruleDescription.root.ThirdPartyTools;
  newStigData.dataValues.mitigation_control = ruleDescription.root.MitigationControl;
  // newStigData.dataValues.responsibility = ruleDescription.Responsibility  //Multiple need to create another table
  newStigData.dataValues.ia_controls = ruleDescription.root.IAControls;
}

async function associateResponsibility(ruleDescription: any, newStigData: StigDataInterface) {
  // console.log(newStigData);
  let responsibilityNode = ruleDescription.root.Responsibility;

  if (!Array.isArray(responsibilityNode)) {
    responsibilityNode = [responsibilityNode];
  }

  for (const responsibility of responsibilityNode) {
    const [stigResponsibility] = await StigResponsibility.findOrCreate({
      where: { name: responsibility },
    });

    const extendedNewStigData = newStigData as StigDataInterface;
    try {
      await extendedNewStigData.addStigResponsibility(stigResponsibility); // TODO: Fix associations
    } catch (error) {
      console.log("Error associating responsibility to stigdata", error);
      logger.error(`Error associating responsibility to stigdata`, { error });
    }
  }
}

async function associateReference(references: any, newStigData: StigDataInterface) {
  // console.log(newStigData);
  // let referencesNode = references;
  if (!Array.isArray(references)) {
    references = [references];
  }

  for (const reference of references) {
    const [stigReference] = await StigReference.findOrCreate({
      where: {
        dc_identifier: reference["dc:identifier"],
        dc_publisher: reference["dc:publisher"],
        dc_subject: reference["dc:subject"],
        dc_title: reference["dc:title"],
        dc_type: reference["dc:type"],
      },
    });

    try {
      await newStigData.addStigReference(stigReference);
    } catch (error) {
      logger.error("Error associating reference to stigdata");
      console.log("Error associating reference to stigdata", error);
    }
  }
}

async function associateIdent(idents: any, newStigData: StigDataInterface) {
  // console.log(newStigData);
  // let referencesNode = references;
  if (!Array.isArray(idents)) {
    idents = [idents];
  }

  for (const ident of idents) {
    const [stigIdent] = await StigIdent.findOrCreate({
      where: {
        system: ident.$.system,
        text: ident._,
      },
    });

    try {
      await newStigData.addStigIdent(stigIdent);
    } catch (error) {
      logger.error("Error associating ident to stigdata");
      console.log("Error associating ident to stigdata", error);
    }
  }
}

export const addStigDataToStig = async (
  stigDataId: number,
  stigId: number,
): Promise<{ error: Boolean; errorMsg: string }> => {
  const stigData = await StigData.findByPk(stigDataId);
  const stig = (await Stig.findByPk(stigId)) as StigInterface;

  if (!stigData || !stig) {
    if (!stigData) {
      return {
        error: true,
        errorMsg: `Unable to find StigDataId: ${stigDataId}`,
      };
    } else {
      return {
        error: true,
        errorMsg: `Unable to find StigId: ${stigId}`,
      };
    }
  }
  console.log(stig);
  await stig.addStigData(stigData);

  return { error: false, errorMsg: "" };
};

export const associateStigDataToStig = async (
  stigData: StigData,
  stig: StigInterface,
): Promise<{ error: Boolean; errorMsg: string }> => {
  await stig.addStigData(stigData);

  return { error: false, errorMsg: "" };
};

function sanitizeTextWithinTags(tagName: string | string[], xmlString: string): string {
  if (Array.isArray(tagName)) {
    let result = xmlString;
    for (const tag of tagName) {
      result = sanitizeForTag(tag, result);
    }
    return result;
  } else {
    return sanitizeForTag(tagName, xmlString);
  }

  function sanitizeForTag(tag: string, str: string): string {
    const regex = new RegExp(`(<${tag}>)(.*?)(</${tag}>)`, "s");
    return str.replace(regex, (match, openTag, textContent, closeTag) => {
      let sanitizedText = textContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return openTag + sanitizedText + closeTag;
    });
  }
}

import { parseStringPromise } from "xml2js";
import { Transaction, ValidationError } from "sequelize";
import { Stig, StigData, StigResponsibility, StigReference, StigIdent } from "../../db/models";
// import { hashObj } from "./hash";
import { PerfTimer } from "./perfTimer";

export async function parseStigData(
  stigGroupObj: any,
  stig: Stig,
  currentStigResponsibilities: StigResponsibility[],
  currentStigReferences: StigReference[],
  currentStigIdents: StigIdent[],
  stigImportTransaction: Transaction,
  perfTimer?: PerfTimer,
): Promise<{ newStigData: StigData; error: boolean }> {
  // const hash = hashObj(stigGroupObj);

  perfTimer?.start("NewFindOrBuild");
  const [newStigData, created] = await StigData.findOrBuild({
    where: { rule_id: stigGroupObj.Rule.$["id"] },
  });
  perfTimer?.stop("NewFindOrBuild");

  if (created) {
    console.log("No match found.  Creating new stig data:", stigGroupObj.Rule.$["id"]);
    logger.debug(`No match found.  Creating new stig data: ${stigGroupObj.Rule.$["id"]}`);
  } else {
    console.log("Match Found:", stigGroupObj.Rule.$["id"]);
    logger.debug(`Match Found: ${stigGroupObj.Rule.$["id"]}`);
  }

  perfTimer?.start("SanitiseAndParse");
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
  perfTimer?.stop("SanitiseAndParse");

  if (created) {
    try {
      perfTimer?.start("SanitiseAndParse");
      console.log("Parsing:", stigGroupObj.Rule.$["id"]);
      logger.debug(`Parsing: ${stigGroupObj.Rule.$["id"]}`);
      parseStigDataObj(stigGroupObj, newStigData); // can throw errors reference undefine
      parseRuleDescription(ruleDescription, newStigData);

      console.log("Saving", stigGroupObj.Rule.$["id"]);
      logger.debug(`Saving ${stigGroupObj.Rule.$["id"]}`);
      perfTimer?.stop("SanitiseAndParse");

      perfTimer?.start("Saving");
      await newStigData.save({ transaction: stigImportTransaction });
      perfTimer?.stop("Saving");

      perfTimer?.start("AssociateStig");
      await stig.addStigData(newStigData, { transaction: stigImportTransaction });
      perfTimer?.stop("AssociateStig");

      if (ruleDescription.root.Responsibility) {
        perfTimer?.start("associateResponsibility");
        await associateResponsibility(
          ruleDescription,
          newStigData,
          currentStigResponsibilities,
          stigImportTransaction,
        );
        perfTimer?.stop("associateResponsibility");
      }

      perfTimer?.start("associateReference");
      await associateReference(
        stigGroupObj.Rule.reference,
        newStigData,
        currentStigReferences,
        stigImportTransaction,
      );
      perfTimer?.stop("associateReference");

      perfTimer?.start("associateIdent");
      await associateIdent(
        stigGroupObj.Rule.ident,
        newStigData,
        currentStigIdents,
        stigImportTransaction,
      );
      perfTimer?.stop("associateIdent");
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
          `Error parsing svkey ${stigGroupObj.Rule.$["id"]} in stig ${stig.dataValues.title}\n${error}`,
        );
        logger.error(
          `Error parsing svkey ${stigGroupObj.Rule.$["id"]} in stig ${stig.dataValues.title}`,
          error,
        );
      }
    }
  } else {
    await stig.addStigData(newStigData, { transaction: stigImportTransaction });
  }

  return { newStigData, error: false };
}

function parseStigDataObj(stigGroupObj: any, newStigData: StigData) {
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
}

function parseRuleDescription(ruleDescription: any, newStigData: StigData) {
  newStigData.dataValues.vuln_discuss = ruleDescription.root.VulnDiscussion;
  newStigData.dataValues.false_positives = ruleDescription.root.FalsePositives;
  newStigData.dataValues.false_negatives = ruleDescription.root.FalseNegatives;
  newStigData.dataValues.documentable = ruleDescription.root.Documentable;
  newStigData.dataValues.mitigations = ruleDescription.root.Mitigations;
  newStigData.dataValues.security_override_guidance = ruleDescription.root.SeverityOverrideGuidance;
  newStigData.dataValues.potential_impact = ruleDescription.root.PotentialImpacts;
  newStigData.dataValues.third_party_tools = ruleDescription.root.ThirdPartyTools;
  newStigData.dataValues.mitigation_control = ruleDescription.root.MitigationControl;
  newStigData.dataValues.ia_controls = ruleDescription.root.IAControls;
}

async function associateResponsibility(
  ruleDescription: any,
  newStigData: StigData,
  currentStigResponsibilities: StigResponsibility[],
  transaction?: Transaction,
) {
  let responsibilityNode = ruleDescription.root.Responsibility;

  if (!Array.isArray(responsibilityNode)) {
    responsibilityNode = [responsibilityNode];
  }

  for (const responsibility of responsibilityNode) {
    if (responsibility) {
      const existingStigResponsibility = currentStigResponsibilities.find(
        (sr) => `${sr.name}` === responsibility,
      );

      let stigResponsibility: StigResponsibility;

      if (!existingStigResponsibility) {
        stigResponsibility = await StigResponsibility.create(
          {
            name: responsibility,
          },
          { transaction },
        );

        currentStigResponsibilities.push(stigResponsibility);
      } else {
        console.log("stigResponsibility cache hit");
        stigResponsibility = existingStigResponsibility;
      }

      try {
        await newStigData.addStigResponsibility(stigResponsibility, { transaction });
      } catch (error) {
        console.log("Error associating responsibility to stigdata", error);
        logger.error(`Error associating responsibility to stigdata`, { error });
      }
    }
  }
}

async function associateReference(
  references: any,
  newStigData: StigData,
  currentStigReferences: StigReference[],
  transaction?: Transaction,
) {
  if (!Array.isArray(references)) {
    references = [references];
  }

  for (const reference of references) {
    if (reference) {
      const existingStigReference = currentStigReferences.find(
        (sr) => `${sr.dc_identifier}` === reference["dc:identifier"],
      );

      let stigReference: StigReference;

      if (!existingStigReference) {
        stigReference = await StigReference.create(
          {
            dc_identifier: reference["dc:identifier"],
            dc_publisher: reference["dc:publisher"],
            dc_subject: reference["dc:subject"],
            dc_title: reference["dc:title"],
            dc_type: reference["dc:type"],
          },
          { transaction },
        );

        currentStigReferences.push(stigReference);
      } else {
        stigReference = existingStigReference;
      }

      try {
        await newStigData.addStigReference(stigReference, { transaction });
      } catch (error) {
        logger.error("Error associating reference to stigdata");
        console.log("Error associating reference to stigdata", error);
      }
    }
  }
}

async function associateIdent(
  idents: any,
  newStigData: StigData,
  currentStigIdents: StigIdent[],
  transaction?: Transaction,
) {
  if (!Array.isArray(idents)) {
    idents = [idents];
  }

  for (const ident of idents) {
    if (ident) {
      const refKey = `${ident.$.system}-${ident._}`;

      const existingStigIdent = currentStigIdents.find(
        (si) => `${si.system}-${si.text}` === refKey,
      );

      let stigIdent: StigIdent;

      if (!existingStigIdent) {
        stigIdent = await StigIdent.create(
          {
            system: ident.$.system,
            text: ident._,
          },
          { transaction },
        );

        currentStigIdents.push(stigIdent);
      } else {
        stigIdent = existingStigIdent;
      }

      try {
        await newStigData.addStigIdent(stigIdent, { transaction });
      } catch (error) {
        logger.error("Error associating ident to stigdata");
        console.log("Error associating ident to stigdata", error);
      }
    }
  }
}
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
      const sanitizedText = textContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return openTag + sanitizedText + closeTag;
    });
  }
}

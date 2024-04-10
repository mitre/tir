import { parseStringPromise } from "xml2js";
import {
  Assessment,
  AssessmentItem,
  Boundary,
  Stig,
  StigData,
  System,
  SystemInterface,
} from "../../db/models";
import { findStigByStigId } from "./stigLibrary";

export async function importXccdf(xmlContent: string, systemId: number) {
  const jsonObj = await parseStringPromise(xmlContent, { explicitArray: false });

  const system = (await System.findByPk(systemId, {
    include: {
      model: Boundary,
    },
  })) as SystemInterface;

  const stigLibraryId = system?.dataValues.Boundary.StigLibraryId;
  const ns = getNamespace(jsonObj);

  const xccdfStigId = jsonObj[`${ns}Benchmark`].$.id;
  const stigId = xccdfStigId.replace("xccdf_mil.disa.stig_benchmark_", "");

  const stigMatch = await findStigByStigId(stigId, stigLibraryId);

  if (!stigMatch) {
    throw createError({
      statusCode: 415,
      statusMessage: `No STIG matching id "${stigId}" found in system's assigned Library`,
    });
  }

  const alreadyHasStig = await system.hasStig(stigMatch.dataValues.id);
  if (!alreadyHasStig) {
    await system.addStig(stigMatch.dataValues.id);
  }

  let assessmentToPopulate: Assessment;
  const foundAssessment = await Assessment.findOne({
    where: {
      SystemId: systemId,
      StigId: stigMatch.dataValues.id,
    },
  });

  if (foundAssessment) {
    assessmentToPopulate = foundAssessment;
  } else {
    const newAssessment = await findOrCreateAssessment(
      systemId,
      stigMatch.dataValues.id,
      // classification can be found in SCC rear-matter but not in OSCAP?
    );
    assessmentToPopulate = newAssessment;
  }

  const stigChecks = await StigData.findAll({
    include: [
      {
        model: Stig,
        where: { id: stigMatch.dataValues.id },
      },
    ],
  });

  for (const check of stigChecks) {
    const elementMatched = findVulnElementBySV(
      jsonObj[`${ns}Benchmark`][`${ns}TestResult`][`${ns}rule-result`],
      check.dataValues.rule_id,
    );

    const assessmentItemToUpdate = await AssessmentItem.findOne({
      where: {
        AssessmentId: assessmentToPopulate.dataValues.id,
        StigDatumId: check.dataValues.id,
      },
    });

    if (elementMatched && assessmentItemToUpdate) {
      assessmentItemToUpdate.setDataValue("status", resultToStatus(elementMatched[`${ns}result`]));
      if (elementMatched[`${ns}message`]) {
        assessmentItemToUpdate.setDataValue("finding_details", elementMatched[`${ns}message`]._);
      }
      await assessmentItemToUpdate.save();
    }
  }
}

type resultElement = {
  $: {
    idref: string;
    role: string;
    severity: string;
    time: string;
    version: string;
    weight: string;
  };
  [key: string]: any;
};

function findVulnElementBySV(array: resultElement[], SVNum: string): resultElement | undefined {
  return array.find((obj) => obj.$ && obj.$.idref === `xccdf_mil.disa.stig_rule_${SVNum}`);
}

function getNamespace(jsonObj: any) {
  if ("cdf:Benchmark" in jsonObj) {
    return "cdf:";
  } else {
    return "";
  }
}

function resultToStatus(result: string) {
  if (result === "pass") return "NotAFinding";
  if (result === "fail") return "Open";
  if (result === "notchecked") return "Not_Reviewed";
  if (result === "error") return "Not_Reviewed";

  logger.error(`Unknown status ${result}, set to Not_Reviewed`);
  return "Not_Reviewed";
}

import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";
import { DateTime } from "luxon";
import { Op, UniqueConstraintError } from "sequelize";
import {
  Assessment,
  AssessmentItem,
  StigData,
  StigLibrary,
  System,
  Stig,
  StigAlias,
} from "../../db/models";
import { hashFile } from "./hash";
import { createBlankAssessment } from "./assessments";

export type ProcessLibraryResults = {
  stigProcessed: number;
  newStigCount: number;
  updatedStigCount: number;
  unchangedStigCount: number;
  xmlsExtracted: number;
};

export const migrateBoundary = async (
  boundaryId: number,
  newStigLibraryId: number,
): Promise<{ results: string }> => {
  try {
    const boundarySystems = await System.findAll({ where: { BoundaryId: boundaryId } });
    for (const system of boundarySystems) {
      const currentAssessments = await Assessment.findAll({
        where: {
          SystemId: system.id,
          succeededByAssessmentId: { [Op.is]: null },
        },
      });
      for (const assessment of currentAssessments) {
        const oldStig = await Stig.findOne({ where: { id: assessment.StigId } });
        const newStig = await Stig.findOne({
          where: { stigid: oldStig.stigid },
          include: [
            {
              model: StigLibrary,
              where: { id: newStigLibraryId },
              required: true,
            },
          ],
        });

        await system.removeStig(oldStig);
        await system.addStig(newStig);

        const newAssessment = await createBlankAssessment(assessment.SystemId, newStig.id);

        assessment.succeededByAssessmentId = newAssessment.id;
        await assessment.save();

        const oldChecks = await AssessmentItem.findAll({
          where: { AssessmentId: assessment.id },
          include: [{ model: StigData, attributes: ["vuln_num", "rule_id"] }],
        });
        const newChecks = await AssessmentItem.findAll({
          where: { AssessmentId: newAssessment.id },
          include: [{ model: StigData, attributes: ["vuln_num", "rule_id"] }],
        });

        for (const check of newChecks) {
          const matchingCheck = findMatch(check, oldChecks);

          if (matchingCheck) {
            check.status = matchingCheck?.status;
            check.comments = matchingCheck?.comments;
            check.finding_details = matchingCheck?.finding_details;
            check.severity_override = matchingCheck?.severity_override;
            check.severity_justification = matchingCheck?.severity_justification;
            check.AssessmentId = newAssessment.id;
            await check.save();
          }
        }
      }
    }
    return { results: "Success" };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const findMatch = (check: AssessmentItem, array: AssessmentItem[]) => {
  // return array.find((item) => item.StigDatum?.vuln_num === check.StigDatum?.vuln_num);
  return array.find((item) => item.StigDatum?.rule_id === check.StigDatum?.rule_id);
};

export const processLibrary = async (
  sourceZip: string,
  baseOutputPath: string,
  originalName: string,
): Promise<ProcessLibraryResults> => {
  let outputDirPath = baseOutputPath;

  if (originalName) {
    outputDirPath = path.join(baseOutputPath, originalName.substring(0, originalName.length - 4));
  }

  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  const libraryNameAttributes = parseLibraryName(originalName);
  const hash = await hashFile(sourceZip);

  const newLibrary = await StigLibrary.build({
    filename: libraryNameAttributes.filename,
    hash,
    classification: libraryNameAttributes.classification,
    libraryDate: libraryNameAttributes.date,
    version: libraryNameAttributes.version,
    importedDate: DateTime.now().toISODate(),
  });

  try {
    await newLibrary.save();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      error.errors.forEach((element) => {
        logger.error(`[ERROR] ${libraryNameAttributes.filename} ${element.message}`);
      });
      fs.rmSync(sourceZip);
      throw new Error("Error saving Library entry to DB.  Unique Constraint.", { cause: error });
    } else {
      logger.error("Error saving Library Entry.", { cause: error });
      throw new Error("Error saving Library Entry.");
    }
  }

  const newStigLibrary = await StigLibrary.findOne({
    where: {
      hash: newLibrary.dataValues.hash,
    },
  });

  const filelist = await extractLibrary(sourceZip, outputDirPath);
  fs.rename(sourceZip, path.join(outputDirPath, path.basename(sourceZip)), (error) => {
    if (error) {
      console.log(`[ERROR] Moving file ${error.message}`);
    }
  });

  if (!newStigLibrary) {
    logger.error("Unable to parse library version.");
    throw new Error("Unable to parse library version.");
  }

  const processLibraryResults: ProcessLibraryResults = {
    stigProcessed: 0,
    newStigCount: 0,
    updatedStigCount: 0,
    unchangedStigCount: 0,
    xmlsExtracted: filelist.length,
  };

  for (const xmlFile of filelist) {
    try {
      const parseResults = await parseXmlStig(xmlFile, newStigLibrary);

      if (parseResults.newStig) {
        processLibraryResults.newStigCount++;
      } else if (parseResults.newCheckCount === 0 && parseResults.updatedCheckCount === 0) {
        processLibraryResults.unchangedStigCount++;
      } else {
        processLibraryResults.updatedStigCount++;
      }
    } catch {
      logger.error(`Error Parsig STIG: ${path.basename(xmlFile)}`);
    }
  }

  return processLibraryResults;
};

const extractLibrary = async (sourceZip: string, outputDirectory: string): Promise<string[]> => {
  const temporaryExtraction = path.join(outputDirectory, "tempExtraction");
  const mainZip = new AdmZip(sourceZip);
  const fileList: string[] = [];
  fs.mkdirSync(temporaryExtraction);
  mainZip.extractAllTo(temporaryExtraction, true);

  fs.readdirSync(temporaryExtraction).forEach((nestedFile) => {
    const nestedFilePath = path.join(temporaryExtraction, nestedFile);
    if (path.extname(nestedFile) === ".zip") {
      const nestedZip = new AdmZip(nestedFilePath);
      nestedZip.getEntries().forEach((entry) => {
        if (path.extname(entry.name) === ".xml") {
          nestedZip.extractEntryTo(entry, outputDirectory, false, true);
          fileList.push(path.join(outputDirectory, path.basename(entry.entryName)));
        }
      });
    }
  });

  fs.rmSync(temporaryExtraction, { recursive: true });

  return fileList;
};

interface parseResults {
  filename: string;
  classification: string;
  date: string;
  version: number;
  error: boolean;
  errorMessage?: string;
}

export const parseLibraryName = (filename: string): parseResults => {
  const parsedAttributes: parseResults = {
    filename,
    classification: "",
    date: "",
    version: 0,
    error: false,
  };

  const classificationMatches = filename.match(/^[A-Z]+_/);
  if (classificationMatches && classificationMatches.length > 0) {
    parsedAttributes.classification = classificationMatches[0].replace("_", "");
  } else {
    parsedAttributes.error = true;
    parsedAttributes.errorMessage = "Unable to parse library classification";
  }

  const dateMatches = filename.match(/\d{4}\_\d{2}/);
  if (dateMatches && dateMatches.length > 0) {
    const paddedMatch = dateMatches[0] + "_01";
    parsedAttributes.date = DateTime.fromFormat(paddedMatch, "yyyy_LL_dd").toISODate() || "";
  } else {
    parsedAttributes.error = true;
    parsedAttributes.errorMessage = "Unable to parse library date.";
  }

  const versionMatches = filename.match(/v\d\.zip$/);
  if (versionMatches && versionMatches.length > 0) {
    parsedAttributes.version = parseInt(versionMatches[0].substring(1, 2), 10);
  } else {
    parsedAttributes.error = true;
    parsedAttributes.errorMessage = "Unable to parse library version";
  }

  return parsedAttributes;
};

export const findStigByStigId = async (
  stigid: string,
  stigLibraryId: number,
): Promise<Stig | null> => {
  const stigAliases = await StigAlias.findAll({
    where: {
      alias: stigid,
    },
  });

  const aliasTocheck: string[] = [stigid];

  for (const stigAlias of stigAliases) {
    aliasTocheck.push(stigAlias.identifier);
  }

  for (const alias of aliasTocheck) {
    const stigMatch = await Stig.findOne({
      where: {
        stigid: alias,
      },
      include: [
        {
          model: StigLibrary,
          attributes: [],
          where: {
            id: stigLibraryId,
          },
        },
      ],
    });
    if (stigMatch) {
      return stigMatch;
    }
  }

  return null;
};

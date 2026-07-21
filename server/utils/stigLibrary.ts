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
import { recomputeAndSummarize, type RevisionSummary } from "./libraryRevisions";

import type { ProgressStreamer } from "~/server/utils/progressBar";

export type Classification = "U" | "FOUO" | "CUI";

export type ProcessLibraryResults = {
  stigProcessed: number;
  newStigCount: number;
  updatedStigCount: number;
  unchangedStigCount: number;
  xmlsExtracted: number;
  classification: Classification;
  libraryDate: string;
  skippedPackages: string[];
  failedStigs: string[];
  revision: RevisionSummary | null;
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
          where: { stigid: oldStig?.stigid },
          include: [
            {
              model: StigLibrary,
              where: { id: newStigLibraryId },
              required: true,
            },
          ],
        });

        if (oldStig) {
          await system.removeStig(oldStig);
        }
        if (!newStig) {
          continue;
        }

        await system.addStig(newStig);

        const newAssessment = await createBlankAssessment(assessment.SystemId, newStig.id);
        await createEvaluation(boundaryId, newStig.id);
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
            check.severityOverride = matchingCheck?.severityOverride;
            check.severityOverrideJustification = matchingCheck?.severityOverrideJustification;
            check.AssessmentId = newAssessment.id;
            await check.save();
          }
        }
      }
    }
    return { results: "Success" };
  } catch (error) {
    logger.error(error);
    throw createError({
      statusCode: 400,
      statusMessage: "Error with Migration",
    });
  }
};

export const checkBoundary = async (
  boundaryId: number,
  newStigLibraryId: number,
): Promise<{ results: { stigid: string; version: string }[] }> => {
  console.log("Check Boundary Starting...");
  try {
    const reviewStigs = [];
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
          where: { stigid: oldStig?.stigid },
          include: [
            {
              model: StigLibrary,
              where: { id: newStigLibraryId },
              required: true,
            },
          ],
        });
        if (!newStig && oldStig) {
          reviewStigs.push({
            stigid: oldStig.stigid,
            version: `v${oldStig.version}r${oldStig.stigRelease}`,
          });
          continue;
        }
      }
    }
    return { results: reviewStigs };
  } catch (error) {
    logger.error(error);
    throw createError({
      statusCode: 400,
      statusMessage: "Error with Migration Check",
    });
  }
};

export const findMatch = (check: AssessmentItem, array: AssessmentItem[]) => {
  // return array.find((item) => item.StigDatum?.vuln_num === check.StigDatum?.vuln_num);
  return array.find((item) => item.StigDatum?.rule_id === check.StigDatum?.rule_id);
};

const CLASSIFICATION_RANK: Record<Classification, number> = { U: 0, FOUO: 1, CUI: 2 };

export const classificationFromPackageName = (name: string): Classification | null => {
  const match = name.match(/^(CUI|FOUO|U)_/);
  return match ? (match[1] as Classification) : null;
};

const highestClassification = (values: Classification[]): Classification =>
  values.reduce((max, value) => (CLASSIFICATION_RANK[value] > CLASSIFICATION_RANK[max] ? value : max));

const readBenchmarkDate = (xmlFilePath: string): string | null => {
  const fd = fs.openSync(xmlFilePath, "r");
  try {
    const buffer = Buffer.alloc(65536);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    const header = buffer.toString("utf8", 0, bytesRead);
    const match = header.match(/<status\b[^>]*\bdate="([^"]+)"/);
    return match ? match[1] : null;
  } finally {
    fs.closeSync(fd);
  }
};

const deriveLibraryDate = (xmlFiles: string[]): string => {
  let newest: DateTime | null = null;
  for (const xmlFile of xmlFiles) {
    const raw = readBenchmarkDate(xmlFile);
    if (!raw) continue;
    const parsed = DateTime.fromISO(raw);
    if (!parsed.isValid) continue;
    if (!newest || parsed > newest) {
      newest = parsed;
    }
  }
  if (!newest) {
    throw new Error("Unable to determine library date from benchmark status dates.");
  }
  return newest.toISODate() as string;
};

export const processLibrary = async (
  sourceZip: string,
  baseOutputPath: string,
  jobUid: string,
  originalName: string,
  streamer: ProgressStreamer,
): Promise<ProcessLibraryResults> => {
  // "-work" keeps this clear of the uploaded zip itself: tus stores it at
  // baseOutputPath/<jobUid>, because uploads are named after the job.
  const outputDirPath = path.join(baseOutputPath, `${jobUid}-work`);
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  const hash = await hashFile(sourceZip);
  const { xmlFiles, importedPackages, skippedPackages } = extractLibrary(sourceZip, outputDirPath);

  if (importedPackages.length === 0) {
    throw new Error("No marked STIG packages ({U,CUI,FOUO}_) found; nothing imported.");
  }
  if (skippedPackages.length > 0) {
    streamer.status(
      `Skipped ${skippedPackages.length} unmarked package(s): ${skippedPackages.join(", ")}`,
    );
  }

  const classification = highestClassification(importedPackages.map((pkg) => pkg.classification));
  const libraryDate = deriveLibraryDate(xmlFiles);

  const newLibrary = StigLibrary.build({
    filename: originalName,
    hash,
    classification,
    libraryDate,
  });

  try {
    await newLibrary.save();
    streamer.status(`STIG Library Saved: ${newLibrary.dataValues.id}`);
    streamer.saved(newLibrary.dataValues.id);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      error.errors.forEach((element) => {
        logger.error(`[ERROR] ${originalName} ${element.message}`);
      });
      const existing = await StigLibrary.findOne({ where: { hash } });
      throw new Error(
        `This exact file was already imported as library ${existing?.id} (${existing?.filename}).`,
        { cause: error },
      );
    }
    logger.error("Error saving Library Entry.", { cause: error });
    throw new Error("Error saving Library Entry.");
  }

  const newStigLibrary = await StigLibrary.findOne({ where: { hash } });
  if (!newStigLibrary) {
    throw new Error("Unable to load saved STIG Library.");
  }

  fs.renameSync(sourceZip, path.join(outputDirPath, path.basename(sourceZip)));

  const processLibraryResults: ProcessLibraryResults = {
    stigProcessed: 0,
    newStigCount: 0,
    updatedStigCount: 0,
    unchangedStigCount: 0,
    xmlsExtracted: xmlFiles.length,
    classification,
    libraryDate,
    skippedPackages,
    failedStigs: [],
    revision: null,
  };

  streamer.status(`Extracted ${xmlFiles.length} XML files.`);
  streamer.progress(0);
  for (let i = 0; i < xmlFiles.length; i++) {
    const xmlFile = xmlFiles[i];
    try {
      const parseResults = await parseXmlStig(xmlFile, newStigLibrary);

      if (parseResults.errorCheckCount > 0) {
        processLibraryResults.failedStigs.push(path.basename(xmlFile));
        streamer.status(`Failed to import ${path.basename(xmlFile)} - see the server log.`);
      } else if (parseResults.newStig) {
        processLibraryResults.newStigCount++;
      } else if (parseResults.newCheckCount === 0 && parseResults.updatedCheckCount === 0) {
        processLibraryResults.unchangedStigCount++;
      } else {
        processLibraryResults.updatedStigCount++;
      }

      streamer.status(`Processed file ${i + 1}/${xmlFiles.length}: ${path.basename(xmlFile)}`);
      streamer.progress(Math.round(((i + 1) / xmlFiles.length) * 100));
    } catch {
      logger.error(`Error Parsing STIG: ${path.basename(xmlFile)}`);
      processLibraryResults.failedStigs.push(path.basename(xmlFile));
      streamer.status(`Failed to import ${path.basename(xmlFile)} - see the server log.`);
    }
  }
  streamer.progress(100);
  if (processLibraryResults.failedStigs.length > 0) {
    streamer.status(
      `${processLibraryResults.failedStigs.length} STIG(s) failed to import: ${processLibraryResults.failedStigs.join(", ")}`,
    );
  }

  newStigLibrary.importedDate = DateTime.now().toISO();
  await newStigLibrary.save();

  const revision = await recomputeAndSummarize(newStigLibrary);
  processLibraryResults.revision = revision;
  if (revision && revision.groupSize > 1) {
    streamer.status(
      `Same-date group (${classification} ${libraryDate}) now holds ${revision.groupSize} libraries; ` +
        `this one is "${revision.label ?? "unlabelled"}".`,
    );
    if (revision.diff) {
      const { againstLibraryId, changed, added, removed } = revision.diff;
      if (changed.length + added.length + removed.length === 0) {
        streamer.status(
          `Identical benchmark set to library ${againstLibraryId} - likely a duplicate upload; delete one.`,
        );
      } else {
        streamer.status(
          `Differs from library ${againstLibraryId}: ` +
            `${changed.length} updated, ${added.length} added, ${removed.length} removed.`,
        );
      }
    }
  }

  return processLibraryResults;
};

type ExtractedLibrary = {
  xmlFiles: string[];
  importedPackages: { name: string; classification: Classification }[];
  skippedPackages: string[];
};

const extractLibrary = (sourceZip: string, outputDirectory: string): ExtractedLibrary => {
  const temporaryExtraction = path.join(outputDirectory, "tempExtraction");
  const mainZip = new AdmZip(sourceZip);
  const xmlFiles: string[] = [];
  const importedPackages: { name: string; classification: Classification }[] = [];
  const skippedPackages: string[] = [];
  fs.mkdirSync(temporaryExtraction);
  mainZip.extractAllTo(temporaryExtraction, true);

  fs.readdirSync(temporaryExtraction).forEach((nestedFile) => {
    if (path.extname(nestedFile) !== ".zip") return;

    const classification = classificationFromPackageName(nestedFile);
    if (!classification) {
      skippedPackages.push(nestedFile);
      return;
    }

    const nestedZip = new AdmZip(path.join(temporaryExtraction, nestedFile));
    nestedZip.getEntries().forEach((entry) => {
      if (path.extname(entry.name) !== ".xml") return;
      nestedZip.extractEntryTo(entry, outputDirectory, false, true);
      xmlFiles.push(path.join(outputDirectory, path.basename(entry.entryName)));
    });
    importedPackages.push({ name: nestedFile, classification });
  });

  fs.rmSync(temporaryExtraction, { recursive: true });

  return { xmlFiles, importedPackages, skippedPackages };
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

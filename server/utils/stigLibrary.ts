import * as fs from "fs";
import * as path from "path";
import { pipeline } from "node:stream/promises";
import { open, ZipFile, Entry } from "yauzl";
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
import type { ProgressStreamer } from "~/server/utils/progressBar";
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
export const processLibrary = async (
  sourceZip: string,
  baseOutputPath: string,
  originalName: string,
  streamer: ProgressStreamer,
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
    streamer.status(`STIG Library Saved: ${newLibrary.dataValues.id}`);
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
  streamer.status(`Extracted ${filelist.length} XML files.`);
  streamer.progress(0); // Initial progress (0%)
  for (let i = 0; i < filelist.length; i++) {
    const xmlFile = filelist[i];
    try {
      const parseResults = await parseXmlStig(xmlFile, newStigLibrary);
      if (parseResults.newStig) {
        processLibraryResults.newStigCount++;
      } else if (parseResults.newCheckCount === 0 && parseResults.updatedCheckCount === 0) {
        processLibraryResults.unchangedStigCount++;
      } else {
        processLibraryResults.updatedStigCount++;
      }
      // Send progress update for each file processed
      streamer.status(`Processed file ${i + 1}/${filelist.length}: ${path.basename(xmlFile)}`);
      const progress = Math.round(((i + 1) / filelist.length) * 100);
      streamer.progress(progress); // Send progress as a number
    } catch {
      logger.error(`Error Parsing STIG: ${path.basename(xmlFile)}`);
    }
  }
  streamer.progress(100);
  return processLibraryResults;
};

const openZip = (zipPath: string): Promise<ZipFile> =>
  new Promise((resolve, reject) => {
    open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) {
        reject(err);
      }
      resolve(zipfile);
    });
  });

const isDirectoryEntry = (entry: Entry): boolean => entry.fileName.endsWith("/");

const safeJoin = (baseDir: string, entryName: string): string => {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, entryName);

  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error(`Unsafe zip entry path: ${entryName}`);
  }
  return resolvedTarget;
};

const extractEntryToFile = async (
  zipfile: ZipFile,
  entry: Entry,
  destination: string,
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    zipfile.openReadStream(entry, (err, readStream) => {
      if (err || !readStream) {
        reject(err);
        return;
      }
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      const writeStream = fs.createWriteStream(destination);

      pipeline(readStream, writeStream)
        .then(() => resolve())
        .catch(reject);
    });
  });
};

const forEachZipEntry = async (
  zipfile: ZipFile,
  handler: (entry: Entry) => Promise<void>,
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    zipfile.readEntry();

    zipfile.on("entry", (entry) => {
      (async () => {
        try {
          await handler(entry);
          zipfile.readEntry();
        } catch (error) {
          reject(error);
        }
      })();
    });
    zipfile.on("end", resolve);
    zipfile.on("error", reject);
  });
};

export const extractLibrary = async (
  sourceZip: string,
  outputDirectory: string,
): Promise<string[]> => {
  const temporaryExtraction = path.join(outputDirectory, "tempExtraction");
  const fileList: string[] = [];

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.mkdirSync(temporaryExtraction, { recursive: true });

  try {
    const mainZip = await openZip(sourceZip);

    await forEachZipEntry(mainZip, async (entry) => {
      if (isDirectoryEntry(entry)) {
        return;
      }

      if (path.extname(entry.fileName).toLowerCase() !== ".zip") {
        return;
      }

      const nestedZipPath = safeJoin(temporaryExtraction, path.basename(entry.fileName));
      await extractEntryToFile(mainZip, entry, nestedZipPath);
    });
    mainZip.close();

    const nestedFiles = fs.readdirSync(temporaryExtraction);
    for (const nestedFile of nestedFiles) {
      if (path.extname(nestedFile).toLowerCase() !== ".zip") {
        continue;
      }

      const nestedZipPath = path.join(temporaryExtraction, nestedFile);
      const nestedZip = await openZip(nestedZipPath);

      await forEachZipEntry(nestedZip, async (entry) => {
        if (isDirectoryEntry(entry)) {
          return;
        }

        if (path.extname(entry.fileName).toLowerCase() !== ".xml") {
          return;
        }

        const outputPath = safeJoin(outputDirectory, path.basename(entry.fileName));
        await extractEntryToFile(nestedZip, entry, outputPath);
        fileList.push(outputPath);
      });
      nestedZip.close();
    }
    return fileList;
  } finally {
    fs.rmSync(temporaryExtraction, { recursive: true, force: true });
  }
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
  const dateMatches = filename.match(/\d{4}_\d{2}/);
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

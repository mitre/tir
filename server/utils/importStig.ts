import * as fs from "fs";
import { readFileSync } from "fs";
import path from "path";
import { parseStringPromise } from "xml2js";
import { UniqueConstraintError } from "sequelize";
import { Stig, StigIdent, StigLibrary, StigReference, StigResponsibility } from "../../db/models";

export type ParseStigResults = {
  newStig: boolean;
  checksProcessed: number;
  newCheckCount: number;
  updatedCheckCount: number;
  unchangedCheckCount: number;
  errorCheckCount: number;
};

export async function parseXmlStig(
  xmlFilePath: string,
  stigLibrary: StigLibrary,
): Promise<ParseStigResults> {
  const xmlContent = readFileSync(xmlFilePath, "utf8");

  const parseResults: ParseStigResults = {
    newStig: false,
    checksProcessed: 0,
    newCheckCount: 0,
    updatedCheckCount: 0,
    unchangedCheckCount: 0,
    errorCheckCount: 0,
  };

  let jsonObj;

  try {
    jsonObj = await parseStringPromise(xmlContent, { explicitArray: false });
  } catch (error) {
    logger.error(`Error parsing STIG xmlContent: ${path.basename(xmlFilePath)}`);
    throw new Error(`Error parsing STIG xmlContent: ${path.basename(xmlFilePath)}`, {
      cause: error,
    });
  }

  if (!jsonObj?.Benchmark) {
    logger.debug(`Skipping non-STIG XML (no Benchmark element): ${path.basename(xmlFilePath)}`);
    return parseResults;
  }

  const stigImportTransaction = await sequelize.transaction();

  const [newStig, created] = await Stig.findOrBuild({
    where: { filename: path.basename(xmlFilePath) },
    transaction: stigImportTransaction,
  });

  try {
    if (created) {
      parseResults.newStig = true;
      populateStigModel(newStig, jsonObj);
      newStig.dataValues.filename = path.basename(xmlFilePath);
      try {
        await newStig.save({ transaction: stigImportTransaction });
      } catch (error) {
        logger.error(`Error saving the model instance`, { error });
      }
    }

    await stigLibrary.addStig(newStig, { transaction: stigImportTransaction });

    let groupArray = jsonObj.Benchmark.Group;
    if (!Array.isArray(groupArray)) {
      groupArray = [groupArray];
    }
    const perfTimer = new PerfTimer();
    // perfTimer.enable();

    const currentStigResponsibilities = await StigResponsibility.findAll();
    const currentStigReferences = await StigReference.findAll();
    const currentStigIdents = await StigIdent.findAll();

    for (const stigData of groupArray) {
      await parseStigData(
        stigData,
        newStig,
        currentStigResponsibilities,
        currentStigReferences,
        currentStigIdents,
        stigImportTransaction,
        perfTimer,
      );
    }

    await stigImportTransaction.commit();

    perfTimer.globalSummaryPrint();
    fs.rm(xmlFilePath, (err) => {
      if (err) {
        logger.debug(`Error deleting file: ${err}`);
      }
    });

    return parseResults;
  } catch (error) {
    await stigImportTransaction.rollback();

    if (error instanceof UniqueConstraintError) {
      error.errors.forEach((element) => {
        logger.debug(`[duplicate] ${newStig.dataValues.filename} ${element.message}`);
      });
      const errorKey = error.errors?.[0]?.path;
      const errorValue = error.errors?.[0]?.value;

      if (errorKey && errorValue) {
        const stig = await Stig.findOne({
          where: { [errorKey]: errorValue },
        });

        if (stig) {
          parseResults.newStig = false;
        }
      }
    } else {
      parseResults.errorCheckCount++;
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to import STIG: ${newStig.dataValues.filename} - ${message}`, {
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    const errorLibraryDirName = "ErrorLibraryID" + stigLibrary.id.toString(10);
    const errorLibraryDirPath = path.join(path.dirname(xmlFilePath), errorLibraryDirName);
    if (!fs.existsSync(errorLibraryDirPath)) {
      fs.mkdirSync(errorLibraryDirPath, { recursive: true });
    }
    const fullNameDestination = path.join(errorLibraryDirPath, path.basename(xmlFilePath));
    fs.rename(xmlFilePath, fullNameDestination, (err) => {
      if (err) {
        logger.error(`Error moving file: ${err}`);
      }
    });

    return parseResults;
  }
}

type PlainTextItem = {
  _: string;
  $: {
    id: string;
  };
};

function getPlainTextById(array: PlainTextItem[], id: string): string | null {
  if (!Array.isArray(array)) {
    array = [array];
  }
  const item = array.find((element) => element.$ && element.$.id === id);
  return item ? item._ : null;
}

export const addStigToLibrary = async (
  stigId: number,
  stigLibraryId: number,
): Promise<{ error: Boolean; errorMsg: string }> => {
  const stig = await Stig.findByPk(stigId);
  const stigLibrary = (await StigLibrary.findByPk(stigLibraryId)) as StigLibraryInterface;

  if (!stig || !stigLibrary) {
    if (!stig) {
      return {
        error: true,
        errorMsg: `Unable to find StigId: ${stigId}`,
      };
    } else {
      return {
        error: true,
        errorMsg: `Unable to find StigLibraryId: ${stigLibraryId}`,
      };
    }
  }
  await stigLibrary.addStig(stig);

  return { error: false, errorMsg: "Association was fine for stig_stiglibrary" };
};

const populateStigModel = (stigInstance: Stig, jsonObj: any): void => {
  stigInstance.dataValues.dc = jsonObj.Benchmark.$["xmlns:dc"];
  stigInstance.dataValues.xsi = jsonObj.Benchmark.$["xmlns:xsi"];
  stigInstance.dataValues.cpe = jsonObj.Benchmark.$["xmlns:cpe"];
  stigInstance.dataValues.xhtml = jsonObj.Benchmark.$["xmlns:xhtml"];
  stigInstance.dataValues.dsig = jsonObj.Benchmark.$["xmlns:dsig"];
  stigInstance.dataValues.schemaLocation = jsonObj.Benchmark.$["xsi:schemaLocation"];
  stigInstance.dataValues.stigid = jsonObj.Benchmark.$["id"];
  stigInstance.dataValues.lang = jsonObj.Benchmark.$["xml:lang"];
  stigInstance.dataValues.xmlns = jsonObj.Benchmark.$["xmlns"];
  stigInstance.dataValues.status = jsonObj.Benchmark.status._;
  stigInstance.dataValues.status__date = jsonObj.Benchmark.status.$["date"];
  stigInstance.dataValues.title = jsonObj.Benchmark.title;
  stigInstance.dataValues.description = jsonObj.Benchmark.description;
  stigInstance.dataValues.notice__id = jsonObj.Benchmark.notice.$["id"];
  stigInstance.dataValues.notice__lang = jsonObj.Benchmark.notice.$["xml:lang"];
  stigInstance.dataValues.front_matter = jsonObj.Benchmark.front_matter ?? null;
  stigInstance.dataValues.rear_matter = jsonObj.Benchmark.rear_matter ?? null;
  // stigInstance.dataValues.reference__href = jsonObj.Benchmark.reference.$["href"] ?? null;
  stigInstance.dataValues.reference__href = jsonObj.Benchmark.reference.href ?? null;
  stigInstance.dataValues.reference__publisher = jsonObj.Benchmark.reference["dc:publisher"];
  stigInstance.dataValues.reference__source = jsonObj.Benchmark.reference["dc:source"];
  stigInstance.dataValues.plain_text__release_info = getPlainTextById(
    jsonObj.Benchmark["plain-text"],
    "release-info",
  );
  const releaseInfo = stigInstance.dataValues.plain_text__release_info ?? "";
  const releaseMatch = releaseInfo.match(/Release:\s*(\d+)/);
  stigInstance.dataValues.stigRelease = releaseMatch ? parseInt(releaseMatch[1], 10) : 0;
  stigInstance.dataValues.plain_text__generator = getPlainTextById(
    jsonObj.Benchmark["plain-text"],
    "generator",
  );
  stigInstance.dataValues.plain_text__conventionsVersion = getPlainTextById(
    jsonObj.Benchmark["plain-text"],
    "conventionsVersion",
  );
  stigInstance.dataValues.version = parseInt(jsonObj.Benchmark.version, 10);
  stigInstance.dataValues.stigDate =
    releaseInfo.match(/\d{1,2}\s+\w+\s+\d{4}$/)?.[0] ?? stigInstance.dataValues.status__date ?? "";
};

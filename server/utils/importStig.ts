import * as fs from "fs";
import { readFileSync } from "fs";
import path from "path";
import { parseStringPromise } from "xml2js";
import { Transaction, UniqueConstraintError } from "sequelize";
import { Stig, StigIdent, StigLibrary, StigReference, StigResponsibility } from "../../db/models";
// import { hashFile } from "./hash";

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
  // const fileHash = await hashFile(xmlFilePath);
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
  const stigImportTransaction = await sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE });

  const [newStig, created] = await Stig.findOrBuild({
    where: { filename: path.basename(xmlFilePath) },
  });

  try {
    if (created) {
      parseResults.newStig = true;
      populateStigModel(newStig, jsonObj);
      newStig.dataValues.filename = path.basename(xmlFilePath);
      // newStig.dataValues.hash = fileHash;
      try {
        await newStig.save({ transaction: stigImportTransaction });
      } catch (error) {
        console.log("Error saving the model instance:", error);
        logger.error(`Error saving the model instance`, { error });
      }
    }

    await stigLibrary.addStig(newStig, { transaction: stigImportTransaction });
    // const addRequestResult = await addStigToLibrary(newStig.dataValues.id, stigLibraryId);
    // console.log(addRequestResult);

    let groupArray = jsonObj.Benchmark.Group;
    if (!Array.isArray(groupArray)) {
      groupArray = [groupArray];
    }
    console.log("Starting Group processing for :", newStig.dataValues.title);
    const perfTimer = new PerfTimer();
    perfTimer.enable();

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

    stigImportTransaction.commit();

    perfTimer.globalSummaryPrint();
    fs.rm(xmlFilePath, (err) => {
      if (err) {
        console.log(`Error deleting file: ${err}`);
      }
    });

    return { error: false, new: true };
  } catch (error) {
    const returnStatus = { error: true, new: true };
    stigImportTransaction.rollback();

    if (error instanceof UniqueConstraintError) {
      error.errors.forEach((element) => {
        console.log(`[ERROR] ${newStig.dataValues.filename} ${element.message}`);

        // console.log(error)
      });
      const errorKey = error.errors?.[0]?.path;
      const errorValue = error.errors?.[0]?.value;

      if (errorKey && errorValue) {
        const stig = await Stig.findOne({
          where: { [errorKey]: errorValue },
        });

        if (stig) {
          console.log(`Found unique match on ${[errorKey]}`);
          console.log(`Adding stig: ${stig.dataValues.id} to library: ${stigLibrary.id}`);

          // const addResult = addStigToLibrary(stig.dataValues.id, stigLibraryId);
          // if ((await addResult).error) {
          //   returnStatus.error = true;
          //   console.log(`[ERROR] Error found duplicate to library ${(await addResult).errorMsg}`);
          // } else {
          //   returnStatus.error = false;
          // }
          returnStatus.new = false;
        }
      }
    } else {
      console.log(error);
    }

    const errorLibraryDirName = "ErrorLibraryID" + stigLibrary.id.toString(10);
    const errorLibraryDirPath = path.join(path.dirname(xmlFilePath), errorLibraryDirName);
    if (!fs.existsSync(errorLibraryDirPath)) {
      fs.mkdirSync(errorLibraryDirPath, { recursive: true });
    }
    const fullNameDestination = path.join(errorLibraryDirPath, path.basename(xmlFilePath));
    fs.rename(xmlFilePath, fullNameDestination, (err) => {
      if (err) {
        console.log(`Error moving file: ${err}`);
      }
    });

    return returnStatus;
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
  stigInstance.dataValues.stigRelease = parseInt(
    stigInstance.dataValues.plain_text__release_info.match(/^Release: \d{1,2}/)[0].match(/\d+/)[0],
    10,
  );
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
    stigInstance.dataValues.plain_text__release_info.match(/\d{1,2} ... \d{4}$/)[0];
};

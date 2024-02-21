import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";
// import { parseXmlStig } from './importStig';
import { UniqueConstraintError } from "sequelize";
import { StigLibrary } from "../../db/models";
import { hashFile } from "./hash";

const config = useRuntimeConfig();

export const processLibrary = async (
  sourceZip: string,
  baseOutputPath: string,
  originalName: string,
): Promise<number> => {
  // Check output directory exists
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
    hash: hash,
    classification: libraryNameAttributes.classification,
    date: libraryNameAttributes.date,
    version: libraryNameAttributes.version,
  });

  try {
    await newLibrary.save();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      error.errors.forEach((element) => {
        console.log(`[ERROR] ${libraryNameAttributes.filename} ${element.message}`);
      });

      fs.rmSync(sourceZip);
    } else {
      console.log(error);
    }

    return 0;
  } finally {
    // fs.rename(sourceZip, path.join(outputDirPath,path.basename(sourceZip)), (error) => {
    //     if(error){
    //         console.log(`[ERROR] Moving file ${error.message}`)
    //     }
    // })
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

  const extractedXmlCount = filelist.length;
  let newStigCount = 0;
  let oldStigCount = 0;
  console.log(newLibrary);
  // async function processXmlStigs(fileList: string[]) {
  for (const xmlFile of filelist) {
    try {
      const parseResults = await parseXmlStig(xmlFile, newStigLibrary?.dataValues.id);
      if (!parseResults.error) {
        if (parseResults.new) {
          newStigCount++;
        } else {
          oldStigCount++;
        }
      }
    } catch {
      oldStigCount++;
      logger.error(`Error Parsig STIG: ${path.basename(xmlFile)}`);
    }
  }

  console.log(`Added ${newStigCount} new STIGS.`);
  console.log(`Added ${oldStigCount} old STIGS associations.`);
  // }
  // filelist.forEach(async xmlStig => {
  //     const parseResults = await parseXmlStig(xmlStig, newLibrary.dataValues.id)
  //     if(!parseResults.error){
  //         if(parseResults.new){
  //             newStigCount++;
  //         }else{
  //             oldStigCount++;
  //         }
  //     }
  // });

  return extractedXmlCount;
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
          // console.log(`This is the outputDirectory variable: ${outputDirectory}`)
          // console.log(`This is the entryName variable: ${entry.entryName}`)
          // console.log(`This is the parsed name ${path.basename(entry.entryName)}`)
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
  date: Date;
  version: number;
  error: boolean;
  errorMessage?: string;
}

export const parseLibraryName = (filename: string): parseResults => {
  const parsedAttributes: parseResults = {
    filename,
    classification: "",
    date: new Date(),
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
    const dateArray = dateMatches[0].split("_");
    parsedAttributes.date = new Date(parseInt(dateArray[0], 10), parseInt(dateArray[1]) - 1);
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

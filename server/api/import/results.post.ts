import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import { parseXml, XMLDocument } from "libxmljs";
import formidable from "formidable";
import AdmZip from "adm-zip";
import { DateTime } from "luxon";
import { importChecklist } from "../../utils/checklist";
import { importXccdf } from "../../utils/xccdf";
import { System } from "../../../db/models/system";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  console.log("Starting Upload");

  const body = await proccessNodeRequest(event.node.req);

  const uploadedFiles = body.files;
  const dirList: string[] = [];

  for (let i = 0; i < uploadedFiles.length; i++) {
    let fileList: string[];

    const newFileName = path.join(config.temp_folder, uploadedFiles[i].originalFilename);

    const newDir = path.dirname(newFileName);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }

    fs.renameSync(uploadedFiles[i].filepath, newFileName);

    if (path.extname(newFileName) === ".zip") {
      fileList = await processZip(newFileName, config.temp_folder);
    } else {
      fileList = [newFileName];
    }

    for (let j = 0; j < fileList.length; j++) {
      const baseFilename = path.basename(fileList[j]);
      let systemId;

      if (body.SystemId) {
        systemId = body.SystemId[j] || body.SystemId[0];
      } else {
        const systemName = path.basename(path.dirname(fileList[j]));
        systemId = await createOrFindSystem(systemName, body.BoundaryId);
      }

      const fileData = fs.readFileSync(fileList[j], "utf-8");

      if (path.extname(baseFilename) === ".xml") {
        if (verifyXccdf(fileData)) {
          await importXccdf(fileData, systemId);
        }
      }

      if (path.extname(baseFilename) === ".ckl") {
        await importChecklist(fileData, systemId);
      }

      if (dirList.findIndex((o) => o === path.dirname(fileList[j])) === -1) {
        dirList.push(path.dirname(fileList[j]));
      }

      fs.rmSync(fileList[j]);
    }
  }

  for (let i = 0; i < dirList.length; i++) {
    if (path.dirname(dirList[i]) !== path.dirname(config.temp_folder)) {
      fs.rmSync(dirList[i], { recursive: true });
    }
  }

  return { success: true };
});

const verifyXccdf = (xmlData: string): boolean => {
  const xsdData = fs.readFileSync("./lib/schema/xccdf_1.2.xsd", "utf8");
  let xmlDoc;
  try {
    xmlDoc = parseXml(xmlData);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Error parsing XML file.`,
    });
  }

  const xsdDoc: XMLDocument = parseXml(xsdData, { baseUrl: "./lib/schema/" });

  try {
    const validationResult = xmlDoc.validate(xsdDoc);

    if (typeof validationResult === "boolean") {
      if (validationResult) {
        console.log("XML is valid according to the XSD.");
        return true;
      } else {
        console.error("XML is invalid according to the XSD:");
        xmlDoc.validationErrors.forEach((error: any) => console.error(error));
      }
    }
  } catch (error) {
    console.error("Error during validation:", error);
    return false;
  }
  return false;
};

const processZip = async (zipFile: string, outputPath: string): Promise<string[]> => {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const filelist = await extractLibrary(zipFile, outputPath);

  return filelist;
};

const extractLibrary = async (sourceZip: string, outputDirectory: string): Promise<string[]> => {
  const temporaryExtraction = path.join(outputDirectory, "tempExtraction");
  const mainZip = new AdmZip(sourceZip);
  const fileList: string[] = [];
  await mainZip.extractAllTo(temporaryExtraction, true);

  fs.readdirSync(temporaryExtraction, {
    encoding: "utf8",
    recursive: true,
  }).forEach((nestedFile) => {
    const filePath = path.join(temporaryExtraction, nestedFile);
    if (path.extname(nestedFile) === ".ckl" || path.extname(nestedFile) === ".xml") {
      fileList.push(filePath);
    }
  });

  fs.rmSync(sourceZip);
  return fileList;
};

const createOrFindSystem = async (SystemName: string, BoundaryId: number): Promise<number> => {
  const [system] = await System.findOrBuild({
    where: {
      name: SystemName,
      BoundaryId,
    },
  });

  system.dataValues.lastUpdate = DateTime.now().toISO();
  await system.save();

  return system.dataValues.id;
};

/**
 * @param {import('http').IncomingMessage} req
 */
function proccessNodeRequest(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    /** @see https://github.com/node-formidable/formidable/ */
    const form = formidable({
      multiples: true,
      maxFileSize: 350 * 1024 * 1024,
    });

    form.parse(req, (error, fields: Record<string, any>, files: Record<string, any>) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ ...fields, ...files });
    });
  });
}

import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import { parseXml, XMLDocument } from "libxmljs";
import formidable from "formidable";
import AdmZip from "adm-zip";
import { DateTime } from "luxon";
import { importChecklist, importChecklistV3 } from "../../utils/checklist";
import { importXccdf } from "../../utils/xccdf";
import { System, Boundary, Boundary_User } from "../../../db/models";
import { ChecklistV3 } from "../../utils/checklist_v3";
import { importNessus, NessusMatch } from "~/server/utils/nessus";

export default defineEventHandler(async (event) => {
  const body = await proccessNodeRequest(event.node.req);
  if (!body.BoundaryId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Assign system to import.",
    });
  }
  const checkResult = await userCheck(event, undefined, body.BoundaryId[0], undefined);

  if (checkResult.BoundaryRoleId) {
    if (checkResult.BoundaryRoleId === 4) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to edit Boundaries",
      });
    } else {
      const config = useRuntimeConfig();

      console.log("Starting Upload");

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
          } else if (body.SystemName) {
            systemId = await createOrFindSystem(
              body.SystemName[i] || body.SystemName[0],
              body.BoundaryId,
            );
          } else if (path.extname(baseFilename) !== ".nessus") {
            const systemName = path.basename(path.dirname(fileList[j]));
            systemId = await createOrFindSystem(systemName, body.BoundaryId);
          }

          const fileData = fs.readFileSync(fileList[j], "utf-8");

          if (path.extname(baseFilename) === ".xml") {
            if (verifyXccdf(fileData)) {
              await importXccdf(fileData, systemId);
            }
          }

          if (path.extname(baseFilename) === ".nessus") {
            await importNessus(fileData, JSON.parse(body.systemsMatchArray[i]));
          }

          if (path.extname(baseFilename) === ".ckl") {
            await importChecklist(fileData, systemId);
          }

          if (path.extname(baseFilename) === ".cklb") {
            const checklistData: ChecklistV3 = JSON.parse(fileData);
            await importChecklistV3(checklistData, systemId);
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
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
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
    if (
      path.extname(nestedFile) === ".ckl" ||
      path.extname(nestedFile) === ".cklb" ||
      path.extname(nestedFile) === ".xml" ||
      path.extname(nestedFile) === ".nessus"
    ) {
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

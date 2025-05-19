import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import formidable from "formidable";
import AdmZip from "adm-zip";
import { verifyCciList, importCciList } from "../../utils/cci";
import { userCheck } from "~/server/utils/permissionCheck";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  const { temp_folder } = useRuntimeConfig();
  const body = await proccessNodeRequest(event.node.req, temp_folder);

  const uploadedFiles = body.file;
  const dirList: string[] = [];
  let fileList: string[];
  const newFileName = uploadedFiles[0].filepath;

  if (path.extname(newFileName) === ".zip") {
    fileList = await processZip(newFileName, temp_folder);
  } else {
    fileList = [newFileName];
  }

  for (let j = 0; j < fileList.length; j++) {
    const baseFilename = path.basename(fileList[j]);

    if (path.extname(baseFilename) === ".xml") {
      const fileData = fs.readFileSync(fileList[j], "utf-8");
      const verifyResults = verifyCciList(fileData).errormsg;
      if (verifyCciList(fileData).result) {
        const result = await importCciList(fileData);
        if (!result.success) {
          throw createError({
            statusCode: 415,
            statusMessage: result.error,
          });
        }
      } else {
        throw createError({
          statusCode: 415,
          statusMessage: `${verifyResults}`,
        });
      }
    } else {
      throw createError({
        statusCode: 415,
        statusMessage: "Unsupported File Type.",
      });
    }
  }

  for (let i = 0; i < dirList.length; i++) {
    if (path.dirname(dirList[i]) !== path.dirname(temp_folder)) {
      fs.rmSync(dirList[i], { recursive: true });
    }
  }
  logger.info({
    service: "Library",
    message: `User: ${checkResult.user?.email} Uploaded CCI Matrix`,
  });
  return { success: true };
});

function proccessNodeRequest(
  req: IncomingMessage,
  temp_folder: string,
): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: temp_folder,
      keepExtensions: true,
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
    if (path.extname(nestedFile) === ".xml") {
      fileList.push(filePath);
    }
  });

  fs.rmSync(sourceZip);
  return fileList;
};

import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import formidable from "formidable";
import { verifyCciList, importCciList } from "../../utils/cci";
import { User } from "~/db/models";

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, "tirtoken");
  let userId: number;
  if (rawToken) {
    userId = decodeToken(rawToken);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const user = await User.findByPk(userId, {
    attributes: ["email"],
  });

  const config = useRuntimeConfig();

  console.log("Starting Upload");

  const body = await proccessNodeRequest(event.node.req);

  const uploadedFiles = body.file;

  const dirList: string[] = [];

  for (let i = 0; i < uploadedFiles.length; i++) {
    const newFileName = path.join(config.temp_folder, uploadedFiles[i].originalFilename);

    const newDir = path.dirname(newFileName);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }

    fs.renameSync(uploadedFiles[i].filepath, newFileName);
    const fileList = [newFileName];
    for (let j = 0; j < fileList.length; j++) {
      const baseFilename = path.basename(fileList[j]);

      const fileData = fs.readFileSync(fileList[j], "utf-8");
      console.log("File", path.extname(baseFilename));

      if (path.extname(baseFilename) === ".xml") {
        const verifyResults = (await verifyCciList(fileData)).error;

        if ((await verifyCciList(fileData)).result) {
          console.log("CCI Verified");
          const result = await importCciList(fileData);
          if (!result.success) {
            throw createError({
              statusCode: 415,
              statusMessage: result.error,
            });
          }
          console.log("Import CCI: ", result);
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
  }

  for (let i = 0; i < dirList.length; i++) {
    if (path.dirname(dirList[i]) !== path.dirname(config.temp_folder)) {
      fs.rmSync(dirList[i], { recursive: true });
    }
  }
  logger.info({
    service: "Library",
    message: `User: ${user?.email} Uploaded CCI Matrix`,
  });
  return { success: true };
});

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

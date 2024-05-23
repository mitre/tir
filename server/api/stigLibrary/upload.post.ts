import { IncomingMessage } from "http";
import formidable from "formidable";
import { processLibrary, parseLibraryName } from "../../utils/stigLibrary";
import { User } from "~/db/models";

const config = useRuntimeConfig();

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

  const allUsers = await User.findAll({
    attributes: ["email", "id"],
  });

  const reqbody = readBody(event);
  console.log("Starting Upload");
  const body = await proccessNodeRequest(event.node.req);
  const zipArchive = body.file[0].filepath;

  console.log("Parsing Original FileName.");
  const originalFilename = body.file[0].originalFilename;

  const libraryNameAttributes = await parseLibraryName(originalFilename);

  if (libraryNameAttributes.error) {
    console.log("Parsing Error, File doesn't appear to be a STIG Library.");
    libraryNameAttributes.error = false;
  }

  if (!libraryNameAttributes.error) {
    const results = processLibrary(zipArchive, config.temp_folder, originalFilename);
    logger.info({
      service: "Library",
      message: `User: ${user?.email} Uploaded STIG Library:${originalFilename}`,
    });
    for (let i = 0; i < allUsers.length; i++) {
      await $fetch("/api/config/alert", {
        method: "POST",
        body: {
          userId: allUsers[i].id,
          category: "New STIG Library Available",
          message: `STIG Library ${originalFilename} is now available! `,
        },
      });
    }

    return { success: true, filecount: `${results}`, reqbody };
  } else {
    logger.error(`User: ${user?.email} Failed STIG Library Upload:${originalFilename}`);
    return {
      success: !libraryNameAttributes.error,
      errorMessage: libraryNameAttributes.errorMessage,
    };
  }
});

/**
 * @param {import('http').IncomingMessage} req
 */
function proccessNodeRequest(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    /** @see https://github.com/node-formidable/formidable/ */
    const form = formidable({ multiples: true, maxFileSize: 350 * 1024 * 1024 });

    form.parse(req, (error, fields: Record<string, any>, files: Record<string, any>) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ ...fields, ...files });
    });
  });
}

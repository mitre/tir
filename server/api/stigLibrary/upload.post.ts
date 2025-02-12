import { IncomingMessage } from "http";
import formidable from "formidable";
import { processLibrary, parseLibraryName } from "../../utils/stigLibrary";
import { User } from "~/db/models";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  const allUsers = await User.findAll({
    attributes: ["email", "id"],
  });
  const BoundaryUsers = [{}];
  for (let i = 0; i < allUsers.length; i++) {
    BoundaryUsers[i] = { UserId: allUsers[i].id };
  }

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
    try {
      const results = await processLibrary(zipArchive, config.temp_folder, originalFilename);
      logger.info({
        service: "Library",
        message: `User: ${checkResult.user?.email} Uploaded STIG Library:${originalFilename}`,
      });

      await $fetch("/api/config/alert", {
        method: "POST",
        body: {
          BoundaryUsers,
          UserId: checkResult.user.id,
          NotificationCategoryId: 3,
          message: `STIG Library ${originalFilename} is now available! `,
        },
      });

      return { success: true, filecount: `${results}`, reqbody };
    } catch (error) {
      logger.error(
        `User: ${checkResult.user?.email} Failed STIG Library Processing:${originalFilename}`,
      );
      return {
        success: false,
        errorMessage: error,
      };
    }
  } else {
    logger.error(`User: ${checkResult.user?.email} Failed STIG Library Upload:${originalFilename}`);
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
    const form = formidable({ multiples: true, maxFileSize: 500 * 1024 * 1024 });

    form.parse(req, (error, fields: Record<string, any>, files: Record<string, any>) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ ...fields, ...files });
    });
  });
}

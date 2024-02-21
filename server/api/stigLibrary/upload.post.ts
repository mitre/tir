import { IncomingMessage } from "http";
import formidable from "formidable";
import { processLibrary, parseLibraryName } from "../../utils/processLibrary";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
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
    const extractedCount = processLibrary(zipArchive, config.temp_folder, originalFilename);

    return { success: true, filecount: `${extractedCount}`, reqbody };
  } else {
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

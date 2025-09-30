import { IncomingMessage } from "http";
import formidable from "formidable";
import { processLibrary, parseLibraryName } from "../../utils/stigLibrary";
import { User } from "~/db/models";
import { createProgressStreamer } from "~/server/utils/progressBar";

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

  const res = event.node.res;

  const streamer = createProgressStreamer(res);
  // Set headers for SSE (to keep the connection alive for progress updates)
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Connection", "keep-alive");

  // Start progress message
  streamer.status("Processing started...");

  // Process the file and send progress updates
  const body = await proccessNodeRequest(event.node.req);
  const zipArchive = body.file[0].filepath;
  const originalFilename = body.file[0].originalFilename;

  const libraryNameAttributes = await parseLibraryName(originalFilename);

  if (libraryNameAttributes.error) {
    streamer.status("Error: The file doesn't appear to be a STIG Library.");
    res.end();
    logger.error(`User: ${checkResult.user?.email} Failed STIG Library Upload:${originalFilename}`);
    return {
      success: false,
      errorMessage: libraryNameAttributes.errorMessage,
    };
  }

  try {
    // Start processing the library
    const results = await processLibrary(
      zipArchive,
      config.temp_folder,
      originalFilename,
      streamer,
    );
    streamer.status("Processing Completed!");
    logger.info({
      service: "Library",
      message: `User: ${checkResult.user?.email} Uploaded STIG Library:${originalFilename}`,
    });

    res.end();
    await $fetch("/api/config/alert", {
      method: "POST",
      body: {
        BoundaryUsers,
        UserId: checkResult.user.id,
        NotificationCategoryId: 3,
        message: `STIG Library ${originalFilename} is now available! `,
      },
    });

    return { success: true, results };
  } catch (error) {
    streamer.error(`Error occurred during processing: ${error.message}`);
    logger.error(
      `User: ${checkResult.user?.email} Failed STIG Library Processing:${originalFilename}`,
    );

    res.end(); // End the connection
    return { success: false, errorMessage: error.message };
  }
});

/**
 * @param {import('http').IncomingMessage} req
 */
function proccessNodeRequest(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    /** @see https://github.com/node-formidable/formidable/ */
    const form = formidable({
      multiples: true,
      maxFileSize: 500 * 1024 * 1024,
      uploadDir: config.temp_folder,
      keepExtensions: true,
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

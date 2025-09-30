import * as fs from "fs";
import * as path from "path";
import formidable from "formidable";
import { importCciList, verifyCciList } from "~/server/utils/cci";
import { createProgressStreamer } from "~/server/utils/progressBar";
import { userCheck } from "~/server/utils/permissionCheck";

export default defineEventHandler(async (event: H3Event) => {
  const checkResult = await userCheck(event);
  const res = event.node.res;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Connection", "keep-alive");

  const streamer = createProgressStreamer(res);

  const form = formidable({ maxFileSize: 50 * 1024 * 1024 }); // 50MB
  const { fields, files } = await new Promise<any>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const file = files.file?.[0] || files.file;

  if (!file || !file.filepath || path.extname(file.originalFilename) !== ".xml") {
    streamer.error("Unsupported file type.");
    return;
  }

  const fileData = fs.readFileSync(file.filepath, "utf-8");

  streamer.status("Verifying XML...");
  const verify = verifyCciList(fileData);

  if (verify.error) {
    streamer.error("Schema validation failed.");
    return;
  }

  const result = await importCciList(fileData, streamer);

  if (!result.success) {
    streamer.error(result.error ?? "Import failed.");
    return;
  }

  streamer.status("Completed import.");
  streamer.complete();
});

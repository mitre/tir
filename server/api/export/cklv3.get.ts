import {ZipFile} from 'yazl';
import { System } from "../../../db/models";
import { convertToCKL3 } from "../../utils/checklist_v3";

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);
  const checkResult = await userCheck(event, undefined, query.BoundaryId?.toString(), undefined);
  // Use query params to endpoint:
  //       singlestig   (true/false)
  //       boundary     (number)
  //       IgnoreOverrides (true/false)

  const ignoreOverrides = query.IgnoreOverrides === "true";

  if (checkResult.BoundaryRoleId || query.BoundaryId !== null) {
    const system = await System.findAll({ where: { BoundaryId: query.BoundaryId as number } });
    // Get Checklist Array
    const checklists = await convertToCKL3(system, query.SingleStigPerCkl as string, ignoreOverrides);

    // Zip and return checklist array for boundary X
    const zip = new ZipFile();
    for (const ckl of checklists) {
      const pretty = JSON.stringify(ckl);
      // using ckl.target_data.host_name / as folder containing each file to be zipped
      if (query.groupValue === "host") {
         zip.addBuffer(
          Buffer.from(pretty, "utf8"),
          ckl.target_data.host_name + "/" + ckl.title + ".cklb",
        );
      } else if (query.groupValue === "system") {
        zip.addBuffer(
          Buffer.from(pretty, "utf8"),
          ckl.target_data.tir_name + "/" + ckl.title + ".cklb",
        );
      }
    }
        // Set the response headers
    event.node.res.setHeader('Content-Type', 'application/zip');
    event.node.res.setHeader('Content-Disposition', `attachment; filename="${query.BoundaryName}-ChecklistsV3.zip"`);

    // Pipe the ZIP file to the response
    zip.outputStream.pipe(event.node.res);
    zip.end();
    return new Promise((resolve, reject) => {
      event.node.res.on('finish', resolve);
      event.node.res.on('error', reject);
    });
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

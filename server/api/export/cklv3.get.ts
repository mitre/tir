import AdmZip from "adm-zip";
import { System } from "../../../db/models";
import { convertToCKL3 } from "../../utils/checklist_v3";

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);
  const checkResult = await userCheck(event, undefined, query.BoundaryId?.toString(), undefined);
  // Use query params to endpoint:
  //       singlestig   (true/false)
  //       boundary     (number)
  if (checkResult.BoundaryRoleId) {
    const system = await System.findAll({ where: { BoundaryId: query.BoundaryId } });
    // Get Checklist Array
    const checklists = await convertToCKL3(system, query.singlestig);

    // Zip and return checklist array for boundary X
    const zip = new AdmZip();
    for (const ckl of checklists) {
      const pretty = JSON.stringify(ckl);
      // using ckl.target_data.host_name / as folder containing each file to be zipped
      zip.addFile(
        ckl.target_data.host_name + "/" + ckl.title + ".cklb",
        Buffer.from(pretty, "utf8"),
        "Entering checklist v3 for " + ckl.title,
      );
    }
    const willSendThis = zip.toBuffer();
    return willSendThis;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

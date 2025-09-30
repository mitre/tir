import AdmZip from "adm-zip";
import { PullBoundaryData } from "../../utils/exporter";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  // Use query params to endpoint:
  //       boundary   (value) : optional
  const checkResult = await userCheck(event, undefined, query.boundaryId?.toString(), undefined);
  console.log(checkResult);
  if (checkResult.BoundaryRoleId) {
    let returnValue: BoundaryLookup = {};
    if (query.boundaryId == undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: `No boundary specified for export`,
      });
    } else {
      const zip = new AdmZip();
      const boundary = await PullBoundaryData(query.boundaryId.toString());
      if (boundary) {
        const pretty = JSON.stringify(boundary, null, 2);
        zip.addFile(
          boundary.Boundary?.dataValues.name + ".json",
          Buffer.from(pretty, "utf8"),
          "Entering boundary export for index " + boundary.Boundary?.dataValues.id,
        );
        const willSendThis = zip.toBuffer();
        return willSendThis;
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: `Boundary export error`,
        });
      }
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

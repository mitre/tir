import {ZipFile} from 'yazl';
import { PullBoundaryData } from "../../utils/exporter";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  // Use query params to endpoint:
  //       boundary   (value) : optional
  const checkResult = await userCheck(event, undefined, query.boundaryId?.toString(), undefined);
  if (checkResult.BoundaryRoleId) {
    let returnValue: BoundaryLookup = {};
    if (query.boundaryId === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: `No boundary specified for export`,
      });
    } else {
      const zip = new ZipFile();
      if (query.boundaryId === null || query.boundaryId === undefined) {
        throw createError({
          statusCode: 400,
          statusMessage: `No boundary ID specified`,
        });
      }
      const boundary = await PullBoundaryData(query.boundaryId.toString());
      if (boundary) {
        const pretty = JSON.stringify(boundary, null, 2);
        zip.addBuffer(
          Buffer.from(pretty, "utf8"),
          boundary.Boundary?.dataValues.name + ".json",
        );
        event.node.res.setHeader('Content-Type', 'application/zip');
        event.node.res.setHeader('Content-Disposition', `attachment; filename="${query.BoundaryName}-Export.zip"`);
        zip.outputStream.pipe(event.node.res);
        zip.end();
        return new Promise((resolve, reject) => {
          event.node.res.on('finish', resolve);
          event.node.res.on('error', reject);
        });
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

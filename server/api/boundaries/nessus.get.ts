import { Readable } from "node:stream";
import { sendStream } from "h3";
import { generateNessusCsv } from "../../utils/excelExport/nessusExport";
import { NessusOverride } from "~/db/models/nessusOverride";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary, BoundaryInterface, System } from "~/db/models";
import { NessusPluginTypes } from "~/types/nessus";

export default defineEventHandler(async (event) => {
  const body = await getQuery(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId?.toString(), undefined);
  if (checkResult.BoundaryRoleId) {
    const boundary = await Boundary.findOne({ where: { id: body.BoundaryId } });
    if (!boundary) {
      throw createError({
        statusCode: 400,
        statusMessage: `No Existing Boundary with specified ID found: \n` + body.BoundaryId,
      });
    }
    const systems = await System.findAll({ where: { BoundaryId: body.BoundaryId } });
    var reports: NessusReport[] = [];
    for (const system of systems) {
      console.log("Getting export for system", system.id);
      const report = await NessusReport.findOne({
        where: { SystemId: system.id },
        include: [
          {
            model: NessusReportItem,
            include: [
              {
                model: NessusPlugin,
              },
            ],
          },
        ],
      });
      if (report != null) {
        reports.push(report);
      } else {
        console.log("No report data for system", system.id);
      }
    }
    const nessusCSV = await generateNessusCsv(body.BoundaryId, reports);
    const csvString = nessusCSV.map((row) => row.join(",")).join("\n");
    const myBuffer = Buffer.from(csvString, "utf-8");
    const stream = new Readable();
    stream.push(myBuffer);
    stream.push(null);

    var fileName = "Boundary_" + boundary.name.replaceAll(" ", "") + "_NessusExport.csv";
    setResponseHeader(event, "Content-Disposition", 'attachment; filename="' + fileName + '"');
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    logger.info({
      service: "Boundary",
      message: `${body.userEmail} Downloaded Nessus Data for boundary ID: ${body.BoundaryId}`,
    });
    return sendStream(event, stream);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

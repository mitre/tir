import { Readable } from "node:stream";
import { sendStream } from "h3";
import { generateNessusCsv } from "../../utils/excelExport/nessusExport";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary, System } from "~/db/models";
import { NessusCsvHeaders, type HeaderLabel } from "~/types/nessus";
import { Cve } from "~/db/models/cve";
import { NessusOverride } from "~/db/models/nessusOverride";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  if (!query.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: `BoundaryId required.`,
    });
  }

  const BoundaryId = parseInt(query.BoundaryId?.toString(), 10);

  if (isNaN(BoundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  const checkResult = await userCheck(event, undefined, query.BoundaryId?.toString(), undefined);

  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Insufficient Permissions.",
    });
  }
  if (!query.selectedHeaders) {
    throw createError({
      statusCode: 400,
      statusMessage: `No headers selected.`,
    });
  }

  const values = Object.values(NessusCsvHeaders);
  const selectedHeaders = query.selectedHeaders
    .toString()
    .split(",")
    .map((header) => header.trim())
    .filter((header): header is HeaderLabel => values.includes(header as HeaderLabel));

  const factorOverrides = query.factorOverrides?.toString().toLowerCase() !== "false";

  const boundary = await Boundary.findByPk(BoundaryId);
  if (!boundary) {
    throw createError({
      statusCode: 404,
      statusMessage: `No Existing Boundary with specified ID found: \n` + BoundaryId,
    });
  }

  const overrideLookup: { [id: number]: NessusOverride[][] } = {};

  const systems = await System.findAll({ where: { BoundaryId } });
  const reports: NessusReport[] = [];
  for (const system of systems) {
    logger.info({
      service: "Boundary Nessus Get",
      message: `Getting nessus export content for: ${system.id} from boundary ${BoundaryId}.`,
    });
    const report = await NessusReport.findOne({
      where: { SystemId: system.id },
      include: [
        {
          model: NessusReportItem,
          include: [
            {
              model: NessusPlugin,
              include: [
                {
                  model: Cve,
                },
              ],
            },
          ],
        },
      ],
    });
    if (report != null) {
      reports.push(report);
    } else {
      logger.info({
        service: "Boundary Nessus Get",
        message: `No report data for system: ${system.id} to be exported in boundary ${BoundaryId} Nessus export.`,
      });
    }

    const overrides = await NessusOverride.findAll({
      where: {
        SystemId: system.id,
      },
    });

    if (Array.isArray(overrides)) {
      overrideLookup[system.id] = [overrides];
    }
  }

  const nessusCSV = await generateNessusCsv(
    reports,
    overrideLookup,
    selectedHeaders,
    factorOverrides,
  );

  const myBuffer = Buffer.from(nessusCSV, "utf-8");
  const stream = new Readable();
  stream.push(myBuffer);
  stream.push(null);

  const fileName = "Boundary_" + boundary.name.replaceAll(" ", "") + "_NessusExport.csv";
  setResponseHeader(event, "Content-Disposition", 'attachment; filename="' + fileName + '"');
  setResponseHeader(event, "Content-Type", "application/octet-stream");
  logger.info({
    service: "Boundary",
    message: `${checkResult.user.email} Downloaded Nessus Data for boundary ID: ${query.BoundaryId}`,
  });
  return sendStream(event, stream);
});

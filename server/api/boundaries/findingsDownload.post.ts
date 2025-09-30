import { Readable } from "node:stream";
import { sendStream } from "h3";
import { generateFindings } from "../../utils/excelExport/findingsSheet";
import { Boundary, BoundaryInterface } from "~/db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (checkResult.BoundaryRoleId) {
    const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;
    const findingsWorkBook = await generateFindings(body.BoundaryId, body.filterStatus);

    const buffer = await findingsWorkBook.xlsx.writeBuffer();
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    setResponseHeader(event, "Content-Disposition", 'attachment; filename="Findings.txt"');
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    logger.info({
      service: "Boundary",
      message: `${body.userEmail} Downloaded Findings for: ${boundary.name}`,
    });
    return sendStream(event, stream);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

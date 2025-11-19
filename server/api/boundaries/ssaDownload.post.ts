import { Readable } from "node:stream";
import { sendStream } from "h3";
import { generateSSA } from "../../utils/excelExport/ssaExport";
import { Boundary, BoundaryInterface } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (checkResult.BoundaryRoleId) {
    const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;

    const ssaWorkBook = await generateSSA(body.BoundaryId);

    const buffer = await ssaWorkBook.xlsx.writeBuffer();
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    setResponseHeader(
      event,
      "Content-Disposition",
      'attachment; filename="Security Assessment Procedure.txt"',
    );
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    logger.info({
      service: "Boundary",
      message: `${checkResult.user?.email} Downloaded Security Assessment Procedure for: ${boundary.name}`,
    });
    return sendStream(event, stream);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

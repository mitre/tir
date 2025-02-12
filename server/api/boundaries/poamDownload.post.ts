import { Readable } from "node:stream";
import { sendStream } from "h3";
import { generatePoam } from "../../utils/excelExport/poamExport";
import { Boundary, BoundaryInterface } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (checkResult.BoundaryRoleId) {
    const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;

    const poamWorkBook = await generatePoam(
      body.BoundaryId,
      isNaN(checkResult.user.id) ? undefined : checkResult.user.id,
    );

    const buffer = await poamWorkBook.xlsx.writeBuffer();
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    setResponseHeader(event, "Content-Disposition", 'attachment; filename="POAM.txt"');
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    logger.info({
      service: "Boundary",
      message: `${checkResult.user?.email} Downloaded POAM for: ${boundary.name}`,
    });
    return sendStream(event, stream);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

import intoStream from "into-stream";
import { sendStream } from "h3";
// import jwt from "jsonwebtoken";
import { generateFindings } from "../../utils/excelExport/findingsSheet";
import { Boundary, BoundaryInterface } from "~/db/models";

export default defineEventHandler(async (event) => {
  // const rawToken = getCookie(event, "tirtoken");
  // const config = useRuntimeConfig();
  // const decodedToken = jwt.verify(rawToken, config.jwt_key) as { [key: string]: any };

  // const userId = decodedToken.userId;
  const body = await readBody(event);
  const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;
  const findingsWorkBook = await generateFindings(
    body.BoundaryId,
    body.filterStatus,
    // isNaN(userId) ? undefined : userId,
  );

  const buffer = await findingsWorkBook.xlsx.writeBuffer();
  const stream = intoStream(buffer);

  setResponseHeader(event, "Content-Disposition", 'attachment; filename="Findings.txt"');
  setResponseHeader(event, "Content-Type", "application/octet-stream");
  logger.info({
    service: "Boundary",
    message: `${body.userEmail} Downloaded Findings for: ${boundary.name}`,
  });
  return sendStream(event, stream);
});

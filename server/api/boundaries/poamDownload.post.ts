import intoStream from "into-stream";
import { sendStream } from "h3";
import jwt from "jsonwebtoken";
import { generatePoam } from "../../utils/excelExport/poamExport";

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, "tirtoken");
  const config = useRuntimeConfig();
  const decodedToken = jwt.verify(rawToken, config.jwt_key) as { [key: string]: any };

  const userId = decodedToken.userId;
  const body = await readBody(event);

  const poamWorkBook = await generatePoam(body.BoundaryId, isNaN(userId) ? undefined : userId);

  const buffer = await poamWorkBook.xlsx.writeBuffer();
  const stream = intoStream(buffer);

  setResponseHeader(event, "Content-Disposition", 'attachment; filename="POAM.txt"');
  setResponseHeader(event, "Content-Type", "application/octet-stream");

  return sendStream(event, stream);
});

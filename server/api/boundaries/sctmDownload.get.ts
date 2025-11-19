import ExcelJS from "exceljs";
import { generateEMass } from "../../utils/excelExport/eMassExport";
import { generateSctm } from "../../utils/excelExport/sctmExport";
import { generateSecurityControlAssessment } from "../../utils/excelExport/scaExport";
import { Boundary, BoundaryInterface } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);

  if (!query.filterValue) {
    throw createError({
      statusCode: 400,
      statusMessage: "Checkbox not selected.",
    });
  }

  if (!query.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: `BoundaryId required.`,
    });
  }

  const BoundaryId = parseInt(query.BoundaryId.toString(), 10);

  if (isNaN(BoundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  const checkResult = await userCheck(event, undefined, BoundaryId, undefined);
  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Insufficient Permissions.",
    });
  }

  const boundary = (await Boundary.findByPk(BoundaryId)) as BoundaryInterface;
  // eslint-disable-next-line import/no-named-as-default-member
  let sctmWorkBook = new ExcelJS.Workbook();

  if (query.filterValue === "eMASS") {
    sctmWorkBook = await generateEMass(BoundaryId, checkResult.user.id);
  } else if (query.filterValue === "sctm") {
    sctmWorkBook = await generateSctm(BoundaryId, checkResult.user.id);
  } else if (query.filterValue === "sca") {
    sctmWorkBook = await generateSecurityControlAssessment(BoundaryId, checkResult.user.id);
  }

  const buffer = await sctmWorkBook.xlsx.writeBuffer();

  setResponseHeader(event, "Content-Disposition", 'attachment; filename="SCTM.xlsx"');
  setResponseHeader(
    event,
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  setResponseHeader(event, "Content-Length", buffer.byteLength);
  logger.info({
    service: "Boundary",
    message: `${checkResult.user?.email} Downloaded ${query.filterValue
      .toString()
      .toUpperCase()} for: ${boundary.name}`,
  });
  return buffer;
});

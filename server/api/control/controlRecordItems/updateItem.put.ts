import { DateTime } from "luxon";
import { ControlRecordItem, ControlRecord } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.ControlRecordItemId) {
    throw createError({
      statusCode: 404,
      statusMessage: "No ControlRecordItem ID Provided ",
    });
  }
  const nowISO = DateTime.now().toISO();

  body.lastUpdate = nowISO; // DateTime.now().toISO();
  const item = await ControlRecordItem.findByPk(body.ControlRecordItemId, {
    include: [{ model: ControlRecord }],
  });

  if (!item) {
    return { error: true, errorMsg: `ControlRecordItem: ${body.ControlRecordItemId} not found.` };
  }

  const checkResult = await userCheck(
    event,
    undefined,
    item.ControlRecord?.BoundaryId.toString(),
    undefined,
  );
  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not a Member of this Boundary",
    });
  }

  if (checkResult.BoundaryRoleId === 4) {
    throw createError({
      statusCode: 403,
      statusMessage: "Reviewers are unable to edit Control Records",
    });
  }

  const NOT_ALLOWED_FIELDS = new Set([
    "id",
    "ControlId",
    "ControlEnhancementId",
    "ControlRecordId",
  ]);

  const prevAuditStatus = item.getDataValue("AuditControlStatusId");
  const prevAssessorStatus = item.getDataValue("AssessorControlStatusId");
  const assessorStatus = body.AssessorControlStatusId;
  const auditStatus = body.AuditControlStatusId;
  const complianceStatus = body.ComplianceStatusId;

  for (const key of Object.keys(body)) {
    if (NOT_ALLOWED_FIELDS.has(key)) delete body[key];
  }

  if (assessorStatus != null && assessorStatus !== prevAssessorStatus) {
    body.ComplianceStatusId = assessorStatus;
  } else if (auditStatus != null && auditStatus !== prevAuditStatus) {
    body.ComplianceStatusId = auditStatus;
  } else if (complianceStatus != null) {
    body.ComplianceStatusId = complianceStatus;
  }

  await sequelize.transaction(async (trx) => {
    item.set(body);
    await item.save({ transaction: trx });

    if (item.ControlRecord) {
      item.ControlRecord.set("lastUpdate", nowISO);
      await item.ControlRecord.save({ transaction: trx });
    }
  });

  return { error: false };
});

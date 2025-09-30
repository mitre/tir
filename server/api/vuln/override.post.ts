import { Boundary_User, BoundaryRole, System, UserRole } from "~/db/models";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary } from "~/db/models/boundary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const nessusReportItemId = body.id;
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  if (!nessusReportItemId) {
    throw createError({
      statusCode: 399,
      statusMessage: `NessusReportItemId required.`,
    });
  }

  const nessusReportItem = await NessusReportItem.findOne({
    include: {
      model: NessusReport,
      include: [
        {
          model: System,
          include: [
            {
              model: Boundary,
              include: [
                {
                  model: Boundary_User,
                  include: [{ model: BoundaryRole }],
                },
              ],
            },
          ],
        },
      ],
    },
    where: {
      id: nessusReportItemId,
    },
  });
  if (!nessusReportItem) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unable to find NessusReportItem`,
    });
  }
  const boundaryUser = nessusReportItem?.System?.Boundary?.Boundary_User?.find(
    (boundaryUser) => boundaryUser.id === checkResult.user.id,
  );

  if (boundaryUser) {
    console.log("foundUser");
  }

  const updateObject = {
    statusOverride: body.statusOverride,
    statusOverrideJustification: body.statusOverrideJustification,
    severityOverride: body.severityOverride,
    severityOverrideJustification: body.severityOverrideJustification,
  };

  const updated = await nessusReportItem.update(updateObject);

  return { success: true };
});

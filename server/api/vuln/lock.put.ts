import { Boundary_User, BoundaryRole, System, UserRole } from "~/db/models";
import { NessusOverride } from "~/db/models/nessusOverride";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary } from "~/db/models/boundary";
import { NessusOverride } from "~/db/models/nessusOverride";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const nessusReportItemId = body.nessusReportItemId;
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

  await NessusOverride.findOrCreate({
    where: {
      type: body.type,
      NessusPluginId: nessusReportItem.NessusPluginId,
      SystemId: nessusReportItem.NessusReport?.SystemId,
    },
    defaults: {
      type: body.type, // typescript doesn't understand type from where would be used
      value: body.value,
    },
  });

  return { success: true };
});

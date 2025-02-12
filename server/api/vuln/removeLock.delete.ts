import { Boundary_User, BoundaryRole, System } from "~/db/models";
import { Boundary } from "~/db/models/boundary";
import { NessusOverride } from "~/db/models/nessusOverride";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.id) {
    throw createError({
      statusCode: 400,
      statusMessage: `NessusOverrideId required.`,
    });
  }

  const nessusOverride = await NessusOverride.findOne({
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
    where: {
      id: body.id,
    },
  });

  if (!nessusOverride) {
    throw createError({
      statusCode: 404,
      statusMessage: "Override not found.",
    });
  }

  const checkResult = await userCheck(event, nessusOverride.SystemId, undefined, undefined);

  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not a member of the Boundary",
    });
  }

  await NessusOverride.destroy({ where: { id: body.id } });

  return { success: true };
});

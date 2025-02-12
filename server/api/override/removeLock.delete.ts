import { Boundary_User, BoundaryRole, System } from "~/db/models";
import { Boundary } from "~/db/models/boundary";
import { StigOverride } from "~/db/models/stigOverride";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const systemId = body.systemId;

  const rawToken = getCookie(event, "tirtoken");
  let userId: number;

  // if (rawToken) {
  //   userId = decodeToken(rawToken);
  // } else {
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: "Unknown User.",
  //   });
  // }
  userId = 1;

  if (!systemId) {
    throw createError({
      statusCode: 399,
      statusMessage: `SystemId required.`,
    });
  }

  const system = await System.findOne({
    include: {
      model: Boundary,
      include: [
        {
          model: Boundary_User,
          include: [{ model: BoundaryRole }],
        },
      ],
    },
    where: {
      id: systemId,
    },
  });

  if (!system) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unable to find System`,
    });
  }
  const boundaryUser = system?.Boundary?.Boundary_User?.find(
    (boundaryUser) => boundaryUser.id === userId,
  );

  if (boundaryUser) {
    console.log("foundUser");
  }

  await StigOverride.destroy({ where: { id: body.id } });

  return { success: true };
});

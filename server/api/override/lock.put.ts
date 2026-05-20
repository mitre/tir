import { Boundary_User, BoundaryRole, System, UserRole } from "~/db/models";
import { Boundary } from "~/db/models/boundary";
import { StigOverride } from "~/db/models/stigOverride";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const systemId = body.systemId;

  const rawToken = getCookie(event, "tirtoken");
  let userId: number;

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

  const [lockResult, newLock] = await StigOverride.findOrCreate({
    where: {
      type: body.type,
      StigDatumId: body.stigDatumId,
      SystemId: system?.id,
    },
    defaults: {
      type: body.type, // typescriddpt doesn't understand type from where would be used
      value: body.value,
    },
  });

  if (!newLock) {
    lockResult.value = body.value;
    await lockResult.save();
  }

  return { success: true };
});

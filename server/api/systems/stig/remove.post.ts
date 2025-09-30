import {
  Assessment,
  Stig,
  System,
  SystemInterface,
  Boundary,
  Boundary_User,
} from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const stig = await Stig.findByPk(body.StigId);
  const system = (await System.findByPk(body.SystemId)) as SystemInterface;
  const checkResult = await userCheck(event, body.SystemId, undefined, undefined);

  if (!stig || !system) {
    if (!stig) {
      return {
        success: false,
        error: "Unable to find StigId",
        id: body.StigId,
      };
    } else {
      return {
        success: false,
        error: "Unable to find SystemId",
        id: body.SystemId,
      };
    }
  }

  if (checkResult.BoundaryRoleId) {
    if (checkResult.BoundaryRoleId === 4) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to remove STIGs",
      });
    } else {
      await system.removeStig(stig);

      const numDestroyed = await Assessment.destroy({
        where: {
          SystemId: body.SystemId,
          StigId: body.StigId,
        },
      });

      console.log("Destroyed: ", numDestroyed);

      return { success: true };
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
});

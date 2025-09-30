import { Boundary, Boundary_User, StigLibrary, System, User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.TierId);
  if (checkResult.TierRoleId || checkResult.UserRoleId === 1 || body.TierId === null) {
    const boundary = await Boundary.findAll({
      where: [{ TierId: body.TierId }],
      include: [
        {
          model: Boundary_User,
          include: [
            {
              model: User,
              attributes: ["email"],
            },
          ],
        },
        {
          model: Boundary_User,
          include: [
            {
              model: User,
              attributes: ["email"],
            },
          ],
        },
        {
          model: StigLibrary,
          attributes: ["id", "filename"],
        },
      ],
    });

    for (let index = 0; index < boundary.length; ++index) {
      const count = await System.findAndCountAll({
        where: { BoundaryId: boundary[index].dataValues["id"] },
      });
      boundary[index].dataValues["systemCount"] = count.count;
    }

    return boundary;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

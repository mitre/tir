import jwt from "jsonwebtoken";
import { User, Boundary, BoundaryRole, Boundary_User } from "../../../../db/models";

export default defineEventHandler<{ query: { BoundaryId: string } }>(async (event) => {
  const query = getQuery(event);
  if (query.BoundaryId === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing BoundaryId",
    });
  }
  const checkResult = await userCheck(event, undefined, query.BoundaryId, undefined);
  if (checkResult.UserRoleId) {
    const list = await Boundary.findByPk(query.BoundaryId, {
      include: [
        {
          model: Boundary_User,
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName", "email"],
            },
            {
              model: BoundaryRole,
            },
          ],
        },
      ],
    });

    return list;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

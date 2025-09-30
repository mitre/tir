import { Tier, TierRole, User, Tier_User } from "../../../../db/models";
import jwt from "jsonwebtoken";

export default defineEventHandler<{ query: { TierId: string } }>(async (event) => {
  const query = getQuery(event);

  if (query.TierId === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing TierId",
    });
  }
  const checkResult = await userCheck(event, undefined, undefined, query.TierId);
  if (checkResult.UserRoleId) {
    const list = await Tier.findByPk(query.TierId, {
      include: [
        {
          model: Tier_User,
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName", "email"],
            },
            {
              model: TierRole,
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

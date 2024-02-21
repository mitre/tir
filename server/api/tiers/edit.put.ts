import { Tier, Tier_User, User, UserRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, "tirtoken");
  let userId: number;
  if (rawToken) {
    userId = decodeToken(rawToken);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const user = await User.findByPk(userId, {
    attributes: [],
    include: [
      {
        model: UserRole,
        attributes: ["id", "name"],
      },
    ],
  });
  const body = await readBody(event);
  const tier = await Tier.findByPk(body.id, {
    include: [
      {
        model: Tier_User,
      },
    ],
  });
  if (tier) {
    if (body.hasBoundaries) {
      for (let key in body) {
        tier.setDataValue(key, body[key]);
      }
      tier.save();
      return { error: false };
    } else if (tier?.dataValues.ownerId !== userId && user?.dataValues.UserRole.id !== 1) {
      if (tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)) {
        if (
          tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)
            .TierRoleId === 1
        ) {
          for (let key in body) {
            tier.setDataValue(key, body[key]);
          }
          tier.save();
          return { error: false };
        } else {
          throw createError({
            statusCode: 401,
            statusMessage: "Must be an Admin, Owner, or Co-Owner of this Company to Edit.",
          });
        }
      } else {
        throw createError({
          statusCode: 401,
          statusMessage: "Must be an Admin, Owner, or Co-Owner of this Company to Edit.",
        });
      }
    } else {
      for (let key in body) {
        tier.setDataValue(key, body[key]);
      }
      tier.save();
      return { error: false };
    }
  } else {
    return { error: true, errorMsg: `Tier Item: ${body.id} not found.` };
  }
});

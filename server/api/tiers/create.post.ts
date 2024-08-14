import { Tier, Tier_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

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

  const tier = await Tier.findByPk(body.parentId, {
    include: [
      {
        model: Tier_User,
      },
    ],
  });
  const isOwner = tier?.dataValues.ownerId === userId;
  const isMember =
    tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId) !== undefined;

  if (isOwner || isMember) {
    if (
      !isOwner &&
      tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)
        .TierRoleId === 3
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to create Companies",
      });
    } else {
      const tier = await Tier.create(body);

      return tier;
    }
  } else if (body.parentId === null) {
    const tier = await Tier.create(body);
    return tier;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Company",
    });
  }
});

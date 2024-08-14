import { DateTime } from "luxon";
import { Boundary, Tier, Tier_User } from "../../../db/models";

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

  const tier = await Tier.findByPk(body.TierId, {
    include: [
      {
        model: Tier_User,
      },
    ],
  });
  const isOwner = tier?.dataValues.ownerId === userId;
  const isMember =
    tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId) !== undefined;
  console.log(isOwner, isMember);

  if (isOwner || isMember) {
    if (
      !isOwner &&
      tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)
        .TierRoleId === 3
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to create Boundaries",
      });
    } else {
      body.lastUpdate = DateTime.now().toISO();
      const boundary = await Boundary.create(body);

      return boundary;
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Company",
    });
  }
});

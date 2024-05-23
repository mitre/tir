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
    attributes: ["email"],
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

  let isReviewer;
  if (tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)) {
    isReviewer =
      tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)
        .TierRoleId === 3;
  }

  if (tier) {
    if (body.hasBoundaries) {
      if (isReviewer) {
        logger.error(`Insufficient Permissions to Create Boundary. User: ${user?.email}`);
        throw createError({
          statusCode: 401,
          statusMessage: "Reviewers are not able to create Boundaries",
        });
      } else {
        for (let key in body) {
          tier.setDataValue(key, body[key]);
        }
        tier.save();
        logger.info({
          service: "Tiers",
          message: `${user?.email} Successfully Created Boundary for ${tier?.name} `,
        });
        return { error: false };
      }
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
          logger.info({
            service: "Tiers",
            message: `${user?.email} Successfully Edited: ${tier?.name}`,
          });
          return { error: false };
        } else {
          logger.error(`Insufficient Permissions to Edit Company. User: ${user?.email}`);
          throw createError({
            statusCode: 401,
            statusMessage: "Must be an Admin, Owner, or Co-Owner of this Company to Edit.",
          });
        }
      } else {
        logger.error(`Insufficient Permissions to Edit Company. User: ${user?.email}`);
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
      logger.info({
        service: "Tiers",
        message: `${user?.email} Successfully Edited: ${tier?.name}`,
      });
      return { error: false };
    }
  } else {
    logger.error(`Tier Item: ${body.id} not found.`);
    return { error: true, errorMsg: `Tier Item: ${body.id} not found.` };
  }
});

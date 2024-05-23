import { Tier, User, Tier_User, UserRole } from "../../../db/models";

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
  // console.log(tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId));
  if (tier?.dataValues.ownerId !== userId && user?.dataValues.UserRole.id !== 1) {
    if (tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)) {
      if (
        tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId)
          .TierRoleId === 1
      ) {
        await tier?.destroy();
        logger.info({
          service: "Tiers",
          message: `${user?.email} Successfully Deleted: ${tier.name}`,
        });
      } else {
        logger.error(`Insufficient Permissions to delete ${tier.name}. User: ${user?.email}`);
        throw createError({
          statusCode: 401,
          statusMessage: "Must be an Admin, Owner, or Co-Owner of this Company to delete.",
        });
      }
    } else {
      logger.error(`Insufficient Permissions to delete ${tier?.name}. User: ${user?.email}`);
      throw createError({
        statusCode: 401,
        statusMessage: "Must be an Admin, Owner, or Co-Owner of this Company to delete.",
      });
    }
  } else {
    await tier?.destroy();
    logger.info({
      service: "Tiers",
      message: `${user?.email} Successfully Deleted: ${tier?.name}`,
    });
  }
  return { success: 1 };
});

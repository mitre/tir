import { User, Tier, TierInterface, Tier_User } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.TierId);
  if (
    checkResult.TierRoleId === 1 ||
    checkResult.TierRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    const user = await User.findByPk(body.UserId);
    const tier = (await Tier.findByPk(body.TierId)) as TierInterface;
    if (!user || !tier) {
      if (!user) {
        logger.error(`Unable to find UserId`);
        return {
          success: false,
          error: "Unable to find UserId",
          id: body.UserId,
        };
      } else {
        logger.error(`Unable to find TierId`);
        return {
          success: false,
          error: "Unable to find TierId",
          id: body.TierId,
        };
      }
    }
    const tier_user = await Tier_User.findOne({
      where: { TierId: body.TierId, UserId: body.UserId },
    });
    if (tier_user?.dataValues.TierRoleId === 1) {
      throw createError({
        statusCode: 401,
        statusMessage: "Set another User to Owner First",
      });
    } else {
      await tier.removeUser(user);
      logger.info({
        service: "Tiers",
        message: `${user?.email} Successfully Removed from: ${tier.name}`,
      });
      return { success: 1 };
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

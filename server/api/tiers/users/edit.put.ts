import { User, Tier_User, Tier, TierInterface, TierRole } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.TierId);
  if (
    checkResult.TierRoleId === 1 ||
    checkResult.TierRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    const tier = (await Tier.findByPk(body.TierId)) as TierInterface;
    const user = await User.findByPk(body.UserId);
    const role = await TierRole.findByPk(body.TierRoleId);
    const tier_user = await Tier_User.findOne({
      where: { TierId: body.TierId, UserId: body.UserId },
    });
    if (body.TierRoleId === 1) {
      const currentOwner = await Tier_User.findOne({
        where: { TierId: body.TierId, TierRoleId: body.TierRoleId },
      });
      if (currentOwner?.dataValues.UserId === body.UserId) {
        tier_user?.setDataValue("TierRoleId", body.TierRoleId);
        await tier_user?.save();
      } else {
        currentOwner?.setDataValue("TierRoleId", 2);
        await currentOwner?.save();
        tier_user?.setDataValue("TierRoleId", body.TierRoleId);
        await tier_user?.save();
      }
    } else if (tier_user?.dataValues.TierRoleId === 1) {
      throw createError({
        statusCode: 401,
        statusMessage: "Set another User to Owner First",
      });
    } else {
      tier_user?.setDataValue("TierRoleId", body.TierRoleId);
      tier_user?.save();
    }

    logger.info({
      service: "Tiers",
      message: `${tier?.name}: user ${user?.email} role updated to: ${role?.name}`,
    });
    return tier_user;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

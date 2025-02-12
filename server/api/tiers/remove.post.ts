import { Tier, Tier_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.id);

  const tier = await Tier.findByPk(body.id, {
    include: [
      {
        model: Tier_User,
      },
    ],
  });
  if (!tier) {
    throw createError({
      statusCode: 401,
      statusMessage: "Tier could not be found.",
    });
  }
  const subTiers = await Tier.findAll({ where: { parentId: body.id } });
  if (subTiers.length > 0) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please remove any Companies nested within the one you are trying to delete.",
    });
  }

  // console.log(tier?.dataValues.Tier_Users.find((o: { UserId: number }) => o.UserId === userId));
  if (
    checkResult.TierRoleId === 1 ||
    checkResult.TierRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    await tier?.destroy();
    logger.info({
      service: "Tiers",
      message: `${checkResult.user?.email} Successfully Deleted: ${tier.name}`,
    });
    return { success: 1 };
  } else {
    logger.error(
      `Insufficient Permissions to delete ${tier.name}. User: ${checkResult.user?.email}`,
    );
    throw createError({
      statusCode: 401,
      statusMessage: "Must be an Admin, Owner, or Co-Owner of this Company to delete.",
    });
  }
});

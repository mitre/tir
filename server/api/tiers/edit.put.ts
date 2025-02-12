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
    logger.error(`Tier Item: ${body.id} not found.`);
    return { error: true, errorMsg: `Tier Item: ${body.id} not found.` };
  }

  if (
    checkResult.TierRoleId === 1 ||
    checkResult.TierRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    for (const key in body) {
      tier.setDataValue(key, body[key]);
    }
    tier.save();
    logger.info({
      service: "Tiers",
      message: `${checkResult.user?.email} Successfully Edited: ${tier?.name}`,
    });
    return { error: false };
  } else {
    logger.error(`Insufficient Permissions to Edit Company. User: ${checkResult.user?.email}`);
    throw createError({
      statusCode: 401,
      statusMessage: "Must be an Admin, Owner, or Co-Owner of this Company to Edit.",
    });
  }
});

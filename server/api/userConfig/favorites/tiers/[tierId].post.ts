import { Tier, UserConfig } from "../../../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event);

  const tierId = Number(getRouterParam(event, "tierId"));

  const userConfig = await UserConfig.findOne({
    where: {
      UserId: checkResult.user.id,
    },
  });

  if (!userConfig) {
    throw createError({
      statusCode: 404,
      statusMessage: "User configuration not found.",
    });
  }

  const tier = await Tier.findByPk(tierId);

  if (!tier) {
    throw createError({
      statusCode: 404,
      statusMessage: "Company not found.",
    });
  }

  await userConfig.addFavoriteTier(tier);

  return { success: true };
});
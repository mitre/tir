import { Boundary, Tier, UserConfig } from "../../db/models";

type FavoriteType = "tier" | "boundary";
type FavoriteAction = "add" | "remove";

export async function updateUserFavorite(
  event: any,
  type: FavoriteType,
  id: number,
  action: FavoriteAction,
) {
  const checkResult = await userCheck(event);

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

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid favorite ID.",
    });
  }

  if (type === "tier") {
    const tier = await Tier.findByPk(id);

    if (!tier) {
      throw createError({
        statusCode: 404,
        statusMessage: "Company not found.",
      });
    }

    if (action === "add") {
      await userConfig.addFavoriteTier(tier);
    } else {
      await userConfig.removeFavoriteTier(tier);
    }
  } else {
    const boundary = await Boundary.findByPk(id);

    if (!boundary) {
      throw createError({
        statusCode: 404,
        statusMessage: "Boundary not found.",
      });
    }

    if (action === "add") {
      await userConfig.addFavoriteBoundary(boundary);
    } else {
      await userConfig.removeFavoriteBoundary(boundary);
    }
  }

  return {
    success: true,
    action,
    type,
    id,
  };
}
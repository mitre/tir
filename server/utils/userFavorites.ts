import { Boundary, Tier, User } from "../../db/models";

type FavoriteType = "tier" | "boundary";
type FavoriteAction = "add" | "remove";

export async function updateUserFavorite(
  event: any,
  type: FavoriteType,
  id: number,
  action: FavoriteAction,
) {
  const checkResult = await userCheck(event);

  const user = await User.findByPk(checkResult.user.id);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid favorite ID.",
    });
  }

  if (type === "tier") {
    let tier;

    if (action === "add") {
      tier = await Tier.findOne({
        where: { id },
        include: [
          {
            model: User,
            where: { id: user.id },
            attributes: [],
            through: { attributes: [] },
            required: true,
          },
        ],
      });

      if (!tier) {
        throw createError({
          statusCode: 403,
          statusMessage: "You do not have access to this company.",
        });
      }

      await user.addFavoriteTier(tier);
    } else {
      tier = await Tier.findByPk(id);

      if (!tier) {
        throw createError({
          statusCode: 404,
          statusMessage: "Company not found.",
        });
      }

      await user.removeFavoriteTier(tier);
    }
  } else {
    let boundary;

    if (action === "add") {
      boundary = await Boundary.findOne({
        where: { id },
        include: [
          {
            model: User,
            where: { id: user.id },
            attributes: [],
            through: { attributes: [] },
            required: true,
          },
        ],
      });

      if (!boundary) {
        throw createError({
          statusCode: 403,
          statusMessage: "You do not have access to this boundary.",
        });
      }

      await user.addFavoriteBoundary(boundary);
    } else {
      boundary = await Boundary.findByPk(id);

      if (!boundary) {
        throw createError({
          statusCode: 404,
          statusMessage: "Boundary not found.",
        });
      }

      await user.removeFavoriteBoundary(boundary);
    }
  }

  return {
    success: true,
    action,
    type,
    id,
  };
}
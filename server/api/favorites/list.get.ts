import { Boundary, Tier, User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event);

  const user = await User.findByPk(checkResult.user.id, {
    attributes: ["id"],
    include: [
      {
        model: Tier,
        as: "FavoriteTiers",
        through: {
          attributes: [],
        },
      },
      {
        model: Boundary,
        as: "FavoriteBoundaries",
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  return {
    FavoriteTiers: user.FavoriteTiers ?? [],
    FavoriteBoundaries: user.FavoriteBoundaries ?? [],
  };
});

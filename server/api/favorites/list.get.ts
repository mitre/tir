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
        include: [
          {
            model: User,
            where: { id: checkResult.user.id },
            attributes: [],
            through: { attributes: [] },
            required: true,
          },
        ],
      },
      {
        model: Boundary,
        as: "FavoriteBoundaries",
        through: {
          attributes: [],
        },
        include: [
          {
            model: User,
            where: { id: checkResult.user.id },
            attributes: [],
            through: { attributes: [] },
            required: true,
          },
        ],
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

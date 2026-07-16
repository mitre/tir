import { Boundary, UserConfig } from "../../../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event);

  const boundaryId = Number(getRouterParam(event, "boundaryId"));

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

  const boundary = await Boundary.findByPk(boundaryId);

  if (!boundary) {
    throw createError({
      statusCode: 404,
      statusMessage: "Boundary not found.",
    });
  }

  await userConfig.addFavoriteBoundary(boundary);

  return { success: true };
});
import { DateTime } from "luxon";
import { UserConfig } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

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

  if (body.ThemeId !== undefined) {
    userConfig.ThemeId = body.ThemeId;
  }

  if (body.TimezoneId !== undefined) {
    userConfig.TimezoneId = body.TimezoneId;
  }

  userConfig.lastUpdate = DateTime.now().toISO();

  await userConfig.save();

  return userConfig;
});
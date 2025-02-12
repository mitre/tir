import { TirNotifications_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  const body = await readBody(event);
  const deleteNotification = await TirNotifications_User.findOne({
    where: { TirNotificationId: body.id, UserId: checkResult.user.id },
  });

  if (deleteNotification) {
    try {
      deleteNotification.destroy();

      return { success: true };
    } catch {
      return { success: false };
    }
  } else {
    throw createError({
      statusCode: 404,
      statusMessage: "Alert id not found",
    });
  }
});

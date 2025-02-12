import { NotificationCategory, TirNotification, TirNotifications_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const desiredId = parseInt(query.userId, 10);
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.user.id === desiredId) {
    try {
      const userNotifications = await TirNotification.findAll({
        include: [
          {
            model: TirNotifications_User,
            where: { UserId: desiredId },
          },
          {
            model: NotificationCategory,
          },
        ],
      });
      return userNotifications;
    } catch {
      return [];
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

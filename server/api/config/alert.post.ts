import { TirNotification, TirNotifications_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const BoundaryUsers = body.BoundaryUsers;
  delete body.BoundaryUsers;
  try {
    const newNotification = await TirNotification.create(body);

    for (let i = 0; i < BoundaryUsers.length; i++) {
      await newNotification.addUser(BoundaryUsers[i].UserId);
      const userNotification = await TirNotifications_User.findOne({
        where: { UserId: BoundaryUsers[i].UserId, TirNotificationId: newNotification.id },
      });
      userNotification?.setDataValue("read", false);
      userNotification?.save();
    }

    return { success: true };
  } catch (err) {
    return { success: err };
  }
});

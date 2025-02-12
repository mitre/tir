import * as fs from "fs";
import { TirNotifications_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  const body = await readBody(event);
  const desiredIdToRead = body.id;
  // let alertFound = false;
  // if (fs.existsSync(filePath)) {
  //   // Read the existing JSON file
  //   const fileContent = fs.readFileSync(filePath, "utf-8");
  //   alertArray = JSON.parse(fileContent);
  // }
  try {
    const userNotification = await TirNotifications_User.findOne({
      where: { TirNotificationId: desiredIdToRead, UserId: checkResult.user?.id },
    });
    userNotification?.setDataValue("read", true);
    userNotification?.save();
    return { success: true };
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: "Alert id not found",
    });
  }
});

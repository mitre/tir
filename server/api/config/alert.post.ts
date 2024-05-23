import * as fs from "fs";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  const filePath = "config/alertTest.json";

  let alertArray: any[] = [];

  if (fs.existsSync(filePath)) {
    // Read the existing JSON file
    const fileContent = fs.readFileSync(filePath, "utf-8");
    alertArray = JSON.parse(fileContent);
  }

  const body = await readBody(event);
  const userId = body.userId;
  const category = body.category;
  const message = body.message;

  const maxId = alertArray.reduce((max, obj) => {
    return obj.id > max ? obj.id : max;
  }, 0);

  const newId = maxId + 1;
  const newObj = {
    id: newId,
    userId: userId,
    category: body.category,
    message: body.message,
    read: false,
    date: DateTime.now().toISO(),
    dueDate: body.dueDate,
    daysLeft: body.daysLeft,
  };
  alertArray.push(newObj);

  const jsonString = JSON.stringify(alertArray, null, 2);

  try {
    const fileWriteResult = fs.writeFileSync(filePath, jsonString, "utf8");

    return { success: true };
  } catch {
    return { success: false };
  }
});

import { TirConfig } from "~/db/models/tirConfig";

export async function getNotificationTimeout(): Promise<number> {
  const setting = await TirConfig.findOne({ where: { key: "notification_timeout" } });

  if (!setting) {
    return 3000;
  }

  return Number(setting.value);
}

export async function setNotificationTimeout(timeout: number): Promise<void> {
  await TirConfig.upsert({ key: "notification_timeout", value: timeout.toString() });
}

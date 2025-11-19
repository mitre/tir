import { getConfigValue, setConfigValue } from "~/server/utils/config/tirConfig";

export async function getNotificationTimeout(): Promise<number | undefined> {
  const results = await getConfigValue("notification", "timeout");

  const timeout = results !== "" && Number.isFinite(Number(results)) ? Number(results) : undefined;

  return timeout;
}

export async function setNotificationTimeout(timeout: number): Promise<void> {
  await setConfigValue("notification", "timeout", timeout.toString());
}

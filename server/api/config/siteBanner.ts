import { getConfigValue, setConfigValue } from "~/server/utils/config/tirConfig";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    const visible = (await getConfigValue("banner", "siteVisible")) === "true";
    const html = (await getConfigValue("banner", "siteHtml")) || "";
    const color = (await getConfigValue("banner", "siteColor")) || "#1F5BA6";

    return { visible, html, color };
  }

  if (method === "PUT") {
    const body = await readBody<{ visible: boolean; html: string; color: string }>(event);

    if (
      typeof body.visible !== "boolean" ||
      typeof body.html !== "string" ||
      typeof body.color !== "string"
    ) {
      throw createError({ statusCode: 400, message: "Invalid request body" });
    }

    await Promise.all([
      setConfigValue("banner", "siteVisible", body.visible),
      setConfigValue("banner", "siteHtml", body.html),
      setConfigValue("banner", "siteColor", body.color),
    ]);

    return { success: true };
  }

  throw createError({ statusCode: 405, message: "Method Not Allowed" });
});

import { getConfigValue, setConfigValue } from "~/server/utils/tirConfig";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    const visible = (await getConfigValue("siteBanner_visible")) === "true";
    const html = (await getConfigValue("siteBanner_html")) || "";
    const color = (await getConfigValue("siteBanner_color")) || "#1F5BA6";

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
      setConfigValue("siteBanner_visible", body.visible),
      setConfigValue("siteBanner_html", body.html),
      setConfigValue("siteBanner_color", body.color),
    ]);

    return { success: true };
  }

  throw createError({ statusCode: 405, message: "Method Not Allowed" });
});

import { getConfigValue, setConfigValue } from "~/server/utils/tirConfig";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    const mode = (await getConfigValue("loginBanner_mode")) || "none";
    const html = (await getConfigValue("loginBanner_html")) || "";
    const title = (await getConfigValue("loginBanner_title")) || "";

    return { mode, html, title };
  }

  if (method === "PUT") {
    const body = await readBody<{ mode: string; html: string; title: string }>(event);

    const validModes = ["modal", "checkbox", "none"];
    if (
      !validModes.includes(body.mode) ||
      typeof body.html !== "string" ||
      typeof body.title !== "string"
    ) {
      throw createError({ statusCode: 400, message: "Invalid request body" });
    }

    await Promise.all([
      setConfigValue("loginBanner_mode", body.mode),
      setConfigValue("loginBanner_html", body.html),
      setConfigValue("loginBanner_title", body.title),
    ]);

    return { success: true };
  }

  throw createError({ statusCode: 405, message: "Method Not Allowed" });
});

import { getConfigValue, setConfigValue } from "~/server/utils/config/tirConfig";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    const mode = (await getConfigValue("banner", "loginMode")) || "none";
    const html = (await getConfigValue("banner", "loginHtml")) || "";
    const title = (await getConfigValue("banner", "loginTitle")) || "";

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
      setConfigValue("banner", "loginMode", body.mode),
      setConfigValue("banner", "loginHtml", body.html),
      setConfigValue("banner", "loginTitle", body.title),
    ]);

    return { success: true };
  }

  throw createError({ statusCode: 405, message: "Method Not Allowed" });
});

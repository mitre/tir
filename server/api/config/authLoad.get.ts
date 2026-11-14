import { loadAuthConfig } from "~/server/utils/config/authConfig";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const settings = await loadAuthConfig();

  return settings;
});

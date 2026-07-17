import { updateUserFavorite } from "../../../../utils/userConfigFavorites";

export default defineEventHandler(async (event) => {
  const tierId = Number(getRouterParam(event, "tierId"));

  return await updateUserFavorite(event, "tier", tierId, "add");
});
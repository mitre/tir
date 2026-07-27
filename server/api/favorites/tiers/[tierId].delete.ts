import { updateUserFavorite } from "../../../utils/userFavorites";

export default defineEventHandler(async (event) => {
  const tierId = Number(getRouterParam(event, "tierId"));

  return await updateUserFavorite(event, "tier", tierId, "remove");
});
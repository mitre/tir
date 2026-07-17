import { updateUserFavorite } from "../../../../utils/userConfigFavorites";

export default defineEventHandler(async (event) => {
  const boundaryId = Number(getRouterParam(event, "boundaryId"));

  return await updateUserFavorite(event, "boundary", boundaryId, "remove");
});
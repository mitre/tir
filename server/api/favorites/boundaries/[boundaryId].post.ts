import { updateUserFavorite } from "../../../utils/userFavorites";

export default defineEventHandler(async (event) => {
  const boundaryId = Number(getRouterParam(event, "boundaryId"));

  return await updateUserFavorite(event, "boundary", boundaryId, "add");
});
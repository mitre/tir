import { StigLibrary } from "../../../db/models";

export default defineEventHandler(async () => {
  const libraries = await StigLibrary.findAll();
  return libraries;
});

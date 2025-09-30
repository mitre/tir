import { StigLibrary } from "../../../db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);
  const libraries = await StigLibrary.findAll();
  return libraries;
});

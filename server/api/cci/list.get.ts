import { CciList } from "../../../db/models";

export default defineEventHandler(async () => {
  const matrix = await CciList.findAll();
  return matrix;
});

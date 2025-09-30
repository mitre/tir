import { CciList } from "../../../db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);
  const matrix = await CciList.findAll();
  return matrix;
});

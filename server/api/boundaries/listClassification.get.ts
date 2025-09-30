import { Classification } from "../../../db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const classifications = await Classification.findAll();

  return classifications;
});

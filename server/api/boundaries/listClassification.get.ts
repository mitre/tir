import { Classification } from "../../../db/models";

export default defineEventHandler(async () => {
  const classifications = await Classification.findAll();

  return classifications;
});

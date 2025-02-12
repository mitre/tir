import { TirAlias } from "../../../db/models/tirAlias";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);
  const tirAlias = await TirAlias.findAll();
  return tirAlias;
});

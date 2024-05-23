import { TirAlias } from "../../../db/models/tirAlias";

export default defineEventHandler(async () => {
  const tirAlias = await TirAlias.findAll();
  return tirAlias;
});

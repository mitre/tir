import { Tier } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tier = await Tier.create(body);

  return tier;
});

import { System } from "../../../db/models/system";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  body.lastUpdate = Date.now();
  const system = await System.create(body);

  return system;
});

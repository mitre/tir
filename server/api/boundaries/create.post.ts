import { DateTime } from "luxon";
import { Boundary } from "../../../db/models/boundary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  body.lastUpdate = DateTime.now().toISO();
  const boundary = await Boundary.create(body);

  return boundary;
});

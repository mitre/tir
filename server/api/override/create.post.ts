import { DateTime } from "luxon";
import { Override } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  body.createdDate = DateTime.now().toISO();

  const override = await Override.create(body);

  return override;
});

import { Timezone } from "../../../db/models";

export default defineEventHandler(async (event) => {
  userCheck(event, undefined, undefined, undefined);

  const timezones = await Timezone.findAll();

  return timezones;
});

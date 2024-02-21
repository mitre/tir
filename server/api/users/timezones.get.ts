import { Timezone } from "../../../db/models";

export default defineEventHandler(async () => {
  const timezones = await Timezone.findAll();

  return timezones;
});

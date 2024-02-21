import { DateTime } from "luxon";
import type { Seeder } from "../umzug";

const now = DateTime.now().toISO();

const timezoneStringArray = Intl.supportedValuesOf("timeZone");
const timezoneObjectArray = timezoneStringArray.map((str, index) => ({
  id: index + 1,
  name: str,
  creationDate: now,
  lastUpdate: now,
}));

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Timezones", timezoneObjectArray);
  await sequelize.getQueryInterface().bulkUpdate("Users", { TimezoneId: 1 }, { TimezoneId: null });
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("Timezones", { id: timezoneObjectArray.map((s) => s.id) });
};

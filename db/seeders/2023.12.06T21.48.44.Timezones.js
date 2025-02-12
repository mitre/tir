import { DateTime } from "luxon";
const now = DateTime.now().toISO();
const timezoneStringArray = Intl.supportedValuesOf("timeZone");
const timezoneObjectArray = timezoneStringArray.map((str, index) => ({
    id: index + 1,
    name: str,
    creationDate: now,
    lastUpdate: now,
}));
export const up = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().bulkInsert("Timezones", timezoneObjectArray);
    await sequelize.getQueryInterface().bulkUpdate("Users", { TimezoneId: 1 }, { TimezoneId: null });
};
export const down = async ({ context: sequelize }) => {
    await sequelize
        .getQueryInterface()
        .bulkDelete("Timezones", { id: timezoneObjectArray.map((s) => s.id) });
};

import { DateTime } from "luxon";
const now = DateTime.now().toISO();
const seedData = [
    { id: 1, name: "System", creationDate: now, lastUpdate: now },
    { id: 2, name: "Light", creationDate: now, lastUpdate: now },
    { id: 3, name: "Dark", creationDate: now, lastUpdate: now },
];
export const up = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().bulkInsert("Themes", seedData);
    await sequelize.getQueryInterface().bulkUpdate("Users", { ThemeId: 1 }, { ThemeId: null });
};
export const down = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().bulkDelete("Themes", { id: seedData.map((s) => s.id) });
};

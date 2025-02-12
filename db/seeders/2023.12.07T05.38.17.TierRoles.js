import { DateTime } from "luxon";
const now = DateTime.now().toISO();
const seedData = [
    { id: 1, name: "Co-Owner", creationDate: now, lastUpdate: now },
    { id: 2, name: "Editor", creationDate: now, lastUpdate: now },
    { id: 3, name: "Reviewer", creationDate: now, lastUpdate: now },
];
export const up = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().bulkInsert("TierRoles", seedData);
};
export const down = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().bulkDelete("TierRoles", { id: seedData.map((s) => s.id) });
};

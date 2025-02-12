import { DateTime } from "luxon";
const now = DateTime.now().toISO();
const seedData = [
    {
        id: 1,
        partCode: "o",
        partDefinition: "operating system",
        creationDate: now,
        lastUpdate: now,
    },
    {
        id: 2,
        partCode: "a",
        partDefinition: "application",
        creationDate: now,
        lastUpdate: now,
    },
    {
        id: 3,
        partCode: "h",
        partDefinition: "hardware device",
        creationDate: now,
        lastUpdate: now,
    },
];
export const up = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().bulkInsert("CpeParts", seedData);
};
export const down = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().bulkDelete("CpeParts", { id: seedData.map((s) => s.id) });
};

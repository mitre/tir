import { DateTime } from "luxon";

const now = DateTime.now().toISO();

const seedData = [
  {
    id: 1,
    category: "Milestone Due Date",
    creationDate: now,
    lastUpdate: now,
  },
  {
    id: 2,
    category: "POAM Due Date",
    creationDate: now,
    lastUpdate: now,
  },
  {
    id: 3,
    category: "New STIG Library Available",
    creationDate: now,
    lastUpdate: now,
  },
];

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("NotificationCategories", seedData);
};

export const down = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("NotificationCategories", { id: seedData.map((s) => s.id) });
};

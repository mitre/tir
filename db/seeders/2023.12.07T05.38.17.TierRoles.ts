import { DateTime } from "luxon";
import type { Seeder } from "../umzug";

const now = DateTime.now().toISO();

const seedData = [
  { id: 1, name: "Co-Owner", creationDate: now, lastUpdate: now },
  { id: 2, name: "Editor", creationDate: now, lastUpdate: now },
  { id: 3, name: "Reviewer", creationDate: now, lastUpdate: now },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("TierRoles", seedData);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("TierRoles", { id: seedData.map((s) => s.id) });
};

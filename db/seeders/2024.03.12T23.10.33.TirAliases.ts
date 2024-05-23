import { DateTime } from "luxon";
import type { Seeder } from "../umzug";

const now = DateTime.now().toISO();

const seedData = [
  {
    id: 1,
    term: "Company",
    alias: "Company",
    creationDate: now,
    lastUpdate: now,
  },
  {
    id: 2,
    term: "Boundary",
    alias: "Boundary",
    creationDate: now,
    lastUpdate: now,
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("TirAliases", seedData);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("TirAliases", { id: seedData.map((s) => s.id) });
};

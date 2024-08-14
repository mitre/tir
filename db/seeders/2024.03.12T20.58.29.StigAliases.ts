import { DateTime } from "luxon";
import type { Seeder } from "../umzug";

const now = DateTime.now().toISO();

const seedData = [
  {
    id: 1,
    alias: "MOZ_Firefox_Windows",
    identifier: "MOZ_Firefox_STIG",
    creationDate: now,
    lastUpdate: now,
  },
  {
    id: 2,
    alias: "MOZ_Firefox_Linux",
    identifier: "MOZ_Firefox_STIG",
    creationDate: now,
    lastUpdate: now,
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("StigAliases", seedData);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("StigAliases", { id: seedData.map((s) => s.id) });
};

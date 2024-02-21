import { DateTime } from "luxon";
import type { Seeder } from "../umzug";

const now = DateTime.now().toISO();

const seedData = [
  { id: 1, name: "Unclassified", abbreviation: "U", creationDate: now, lastUpdate: now },
  {
    id: 2,
    name: "Controlled Unclassified Information",
    abbreviation: "CUI",
    creationDate: now,
    lastUpdate: now,
  },
  { id: 3, name: "Secret", abbreviation: "S", creationDate: now, lastUpdate: now },
  { id: 4, name: "Top Secret", abbreviation: "TS", creationDate: now, lastUpdate: now },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Classifications", seedData);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("Classifications", { id: seedData.map((s) => s.id) });
};

import { DateTime } from "luxon";
import type { Seeder } from "../umzug";

const now = DateTime.now().toISO();

const userRoles = [
  { id: 1, name: "Admin", creationDate: now, lastUpdate: now },
  { id: 2, name: "User", creationDate: now, lastUpdate: now },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("UserRoles", userRoles);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("UserRoles", { id: userRoles.map((s) => s.id) });
};

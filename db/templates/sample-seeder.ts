import type { Seeder } from "../umzug";

const seedData = [{ id: 1 }];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("", seedData);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("", { id: seedData.map((s) => s.id) });
};

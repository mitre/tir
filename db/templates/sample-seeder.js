const seedData = [{ id: 1 }];

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("", seedData);
};

export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("", { id: seedData.map((s) => s.id) });
};

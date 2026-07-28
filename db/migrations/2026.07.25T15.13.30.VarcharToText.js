export const up = async ({ context: sequelize }) => {
  if (sequelize.getDialect() !== "postgres") return;

  const [columns] = await sequelize.query(`
    SELECT table_name, column_name, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type = 'character varying'
      AND table_name NOT IN ('SequelizeMeta', 'seeder_meta')
  `);

  for (const { table_name, column_name, column_default } of columns) {
    await sequelize.query(
      `ALTER TABLE "${table_name}" ALTER COLUMN "${column_name}" TYPE TEXT;`,
    );
    if (column_default?.includes("::character varying")) {
      const textDefault = column_default.replaceAll(
        "::character varying",
        "::text",
      );
      await sequelize.query(
        `ALTER TABLE "${table_name}" ALTER COLUMN "${column_name}" SET DEFAULT ${textDefault};`,
      );
    }
  }
};

export const down = async () => {};

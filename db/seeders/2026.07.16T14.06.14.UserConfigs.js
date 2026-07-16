import { DateTime } from "luxon";

const now = DateTime.now().toISO();

const userConfigs = [
  {
    UserId: 1,
    ThemeId: null,
    TimezoneId: 1,
    creationDate: now,
    lastUpdate: now,
  },
  {
    UserId: 2,
    ThemeId: null,
    TimezoneId: 1,
    creationDate: now,
    lastUpdate: now,
  },
];

export const up = async ({ context: sequelize }) => {
  const transaction = await sequelize.transaction();

  try {
    for (const userConfig of userConfigs) {
      await sequelize.query(
        `
          INSERT INTO "UserConfigs"
            ("UserId", "ThemeId", "TimezoneId", "creationDate", "lastUpdate")
          SELECT
            :UserId,
            :ThemeId,
            :TimezoneId,
            :creationDate,
            :lastUpdate
          WHERE NOT EXISTS (
            SELECT 1
            FROM "UserConfigs"
            WHERE "UserId" = :UserId
          );
        `,
        {
          replacements: userConfig,
          transaction,
        },
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const down = async ({ context: sequelize }) => {
  const transaction = await sequelize.transaction();

  try {
    await sequelize.getQueryInterface().bulkDelete(
      "UserConfigs",
      {
        UserId: userConfigs.map((config) => config.UserId),
      },
      { transaction },
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
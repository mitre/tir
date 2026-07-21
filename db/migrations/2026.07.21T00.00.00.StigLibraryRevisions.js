import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  const qi = sequelize.getQueryInterface();
  await qi.addColumn("StigLibraries", "revisionLabel", {
    type: DataTypes.TEXT,
    allowNull: true,
  });
  await qi.addColumn("StigLibraries", "labelSource", {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "auto",
  });

  // Only single-member groups: legacy same-date duplicates (possible before
  // this feature) need content ordering, which app-side recompute does on the
  // group's next change.
  await sequelize.query(`
    UPDATE "StigLibraries" SET "revisionLabel" = 'rev 1'
    WHERE "revisionLabel" IS NULL
      AND "labelSource" = 'auto'
      AND "classification" IS NOT NULL
      AND "libraryDate" IS NOT NULL
      AND (
        SELECT COUNT(*) FROM "StigLibraries" AS s2
        WHERE s2."classification" = "StigLibraries"."classification"
          AND s2."libraryDate" = "StigLibraries"."libraryDate"
      ) = 1;
  `);
};

// Raw DROP COLUMN because queryInterface.removeColumn rebuilds the table on
// SQLite, and that DROP TABLE cascades into StigLibrary_Stigs.
export const down = async ({ context: sequelize }) => {
  await sequelize.query('ALTER TABLE "StigLibraries" DROP COLUMN "revisionLabel";');
  await sequelize.query('ALTER TABLE "StigLibraries" DROP COLUMN "labelSource";');
};

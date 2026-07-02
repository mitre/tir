import { sequelize } from "../umzug.js";

// Widen StigData.severity to the full XCCDF Rule/@severity domain
// (unknown | info | low | medium | high). Previously only low/medium/high,
// which rejected SRG rules marked "info".
// SQLite stores ENUM as plain TEXT (no CHECK) and never enforced the values, so
// only Postgres needs changing.
export const up = async () => {
  if (sequelize.getDialect() === "postgres") {
    await sequelize.query(`ALTER TYPE "enum_StigData_severity" ADD VALUE IF NOT EXISTS 'unknown'`);
    await sequelize.query(`ALTER TYPE "enum_StigData_severity" ADD VALUE IF NOT EXISTS 'info'`);
  }
};

export const down = async () => {
  // Postgres cannot remove a value from an enum type, and SQLite never enforced
  // it, so there is nothing to revert.
};

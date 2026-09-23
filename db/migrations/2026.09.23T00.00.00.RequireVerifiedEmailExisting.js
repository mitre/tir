import { sequelize } from "../umzug.js";

// Providers that exist before this field was introduced keep the old behaviour
// (no verified-email check) so an upgrade cannot lock out users whose identity
// provider never marks emails verified. Providers created afterwards get the
// schema default, which is on.
const PROVIDER_KINDS = ["oidc", "oauth"];

async function readIndex(indexKey, tx) {
  const [rows] = await sequelize.query(`SELECT value FROM "TirConfigs" WHERE key = :key`, {
    replacements: { key: indexKey },
    transaction: tx,
  });
  if (!rows.length) return [];
  try {
    return JSON.parse(rows[0].value);
  } catch {
    return [];
  }
}

async function insertIfAbsent(key, value, now, tx) {
  await sequelize.query(
    `INSERT INTO "TirConfigs" (key, value, "lastUpdate", "creationDate")
     SELECT :key, :value, :now, :now
     WHERE NOT EXISTS (SELECT 1 FROM "TirConfigs" WHERE key = :key)`,
    { replacements: { key, value, now }, transaction: tx },
  );
}

export const up = async () => {
  const migration = await sequelize.transaction();
  try {
    const now = new Date().toISOString();
    for (const kind of PROVIDER_KINDS) {
      const ids = await readIndex(`auth:${kind}:index`, migration);
      for (const id of ids) {
        await insertIfAbsent(`auth:${kind}:${id}:requireVerifiedEmail`, "false", now, migration);
      }
    }
    await migration.commit();
  } catch (error) {
    await migration.rollback();
    throw error;
  }
};

export const down = async () => {
  await sequelize.query(`DELETE FROM "TirConfigs" WHERE key LIKE '%:requireVerifiedEmail'`);
};

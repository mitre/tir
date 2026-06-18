import { sequelize } from "../umzug.js";

async function insertIfAbsent(key, value, now, tx) {
  await sequelize.query(
    `INSERT INTO "TirConfigs" (key, value, "lastUpdate", "creationDate")
     SELECT :key, :value, :now, :now
     WHERE NOT EXISTS (SELECT 1 FROM "TirConfigs" WHERE key = :key)`,
    { replacements: { key, value, now }, transaction: tx },
  );
}

async function renameKey(oldKey, newKey, now, tx) {
  await sequelize.query(
    `UPDATE "TirConfigs" SET key = :newKey, "lastUpdate" = :now WHERE key = :oldKey`,
    { replacements: { oldKey, newKey, now }, transaction: tx },
  );
}

async function readIndex(indexKey, tx) {
  const [rows] = await sequelize.query(
    `SELECT value FROM "TirConfigs" WHERE key = :key`,
    { replacements: { key: indexKey }, transaction: tx },
  );
  if (!rows.length) return [];
  try { return JSON.parse(rows[0].value); } catch { return []; }
}

async function deleteAllForProvider(prefix, tx) {
  await sequelize.query(
    `DELETE FROM "TirConfigs" WHERE key LIKE :prefix`,
    { replacements: { prefix: `${prefix}:%` }, transaction: tx },
  );
}

export const up = async () => {
  const migration = await sequelize.transaction();
  try {
    const now = new Date().toISOString();

    const localRenames = [
      ["authLocalEnable",         "auth:local:enable"],
      ["authLocalPasswordLength", "auth:local:passwordLength"],
      ["authLocalUpperCount",     "auth:local:upperCount"],
      ["authLocalLowerCount",     "auth:local:lowerCount"],
      ["authLocalNumberCount",    "auth:local:numberCount"],
      ["authLocalSpecialCount",   "auth:local:specialCount"],
    ];
    for (const [oldKey, newKey] of localRenames) {
      await renameKey(oldKey, newKey, now, migration);
    }

    const [oidcCheck] = await sequelize.query(
      `SELECT 1 FROM "TirConfigs" WHERE key LIKE 'authOidc%' LIMIT 1`,
      { transaction: migration },
    );
    if (oidcCheck.length > 0) {
      const oidcRenames = [
        ["authOidcEnable",        "auth:oidc:scope-1:enable"],
        ["authOidcUrl",           "auth:oidc:scope-1:url"],
        ["authOidcClientId",      "auth:oidc:scope-1:clientId"],
        ["authOidcSecret",        "auth:oidc:scope-1:secret"],
        ["authOidcCallback",      "auth:oidc:scope-1:callback"],
        ["authOidcGroupMappings", "auth:oidc:scope-1:groupMappings"],
      ];
      for (const [oldKey, newKey] of oidcRenames) {
        await renameKey(oldKey, newKey, now, migration);
      }
      await insertIfAbsent("auth:oidc:index",                  '["scope-1"]', now, migration);
      await insertIfAbsent("auth:oidc:scope-1:label",          "OIDC",        now, migration);
      await insertIfAbsent("auth:oidc:scope-1:groupClaimType", "scope",       now, migration);
      await insertIfAbsent("auth:oidc:scope-1:groupClaimPath", "",            now, migration);
    }

    const [ldapCheck] = await sequelize.query(
      `SELECT 1 FROM "TirConfigs" WHERE key LIKE 'authLdap%' LIMIT 1`,
      { transaction: migration },
    );
    if (ldapCheck.length > 0) {
      const ldapRenames = [
        ["authLdapEnable",   "auth:ldap:openldap-1:enable"],
        ["authLdapUrl",      "auth:ldap:openldap-1:url"],
        ["authLdapBindDn",   "auth:ldap:openldap-1:bindDn"],
        ["authLdapPassword", "auth:ldap:openldap-1:password"],
        ["authLdapBaseDn",   "auth:ldap:openldap-1:baseDn"],
      ];
      for (const [oldKey, newKey] of ldapRenames) {
        await renameKey(oldKey, newKey, now, migration);
      }
      await insertIfAbsent("auth:ldap:index",                    '["openldap-1"]', now, migration);
      await insertIfAbsent("auth:ldap:openldap-1:label",         "LDAP",           now, migration);
      await insertIfAbsent("auth:ldap:openldap-1:template",      "openldap",       now, migration);
      await insertIfAbsent("auth:ldap:openldap-1:ssl",           "false",          now, migration);
      await insertIfAbsent("auth:ldap:openldap-1:sslInsecure",   "false",          now, migration);
      await insertIfAbsent("auth:ldap:openldap-1:sslCa",         "",               now, migration);
    }

    await insertIfAbsent("auth:defaultLoginProvider", "local", now, migration);

    await migration.commit();
  } catch (error) {
    await migration.rollback();
    throw error;
  }
};


export const down = async () => {
  const migration = await sequelize.transaction();
  try {
    const now = new Date().toISOString();

    const localRenames = [
      ["auth:local:enable",         "authLocalEnable"],
      ["auth:local:passwordLength", "authLocalPasswordLength"],
      ["auth:local:upperCount",     "authLocalUpperCount"],
      ["auth:local:lowerCount",     "authLocalLowerCount"],
      ["auth:local:numberCount",    "authLocalNumberCount"],
      ["auth:local:specialCount",   "authLocalSpecialCount"],
    ];
    for (const [oldKey, newKey] of localRenames) {
      await renameKey(oldKey, newKey, now, migration);
    }

    const oidcIds = await readIndex("auth:oidc:index", migration);
    if (oidcIds.length > 0) {
      const first = oidcIds[0];
      const oidcRenames = [
        [`auth:oidc:${first}:enable`,        "authOidcEnable"],
        [`auth:oidc:${first}:url`,           "authOidcUrl"],
        [`auth:oidc:${first}:clientId`,      "authOidcClientId"],
        [`auth:oidc:${first}:secret`,        "authOidcSecret"],
        [`auth:oidc:${first}:callback`,      "authOidcCallback"],
        [`auth:oidc:${first}:groupMappings`, "authOidcGroupMappings"],
      ];
      for (const [oldKey, newKey] of oidcRenames) {
        await renameKey(oldKey, newKey, now, migration);
      }
      
      await sequelize.query(
        `DELETE FROM "TirConfigs" WHERE key IN (:keys)`,
        {
          replacements: {
            keys: [
              `auth:oidc:${first}:label`,
              `auth:oidc:${first}:groupClaimType`,
              `auth:oidc:${first}:groupClaimPath`,
            ],
          },
          transaction: migration,
        },
      );
     
      // Delete all additional providers
      for (const id of oidcIds.slice(1)) {
        await deleteAllForProvider(`auth:oidc:${id}`, migration);
      }
    }
    await sequelize.query(
      `DELETE FROM "TirConfigs" WHERE key = 'auth:oidc:index'`,
      { transaction: migration },
    );

    const ldapIds = await readIndex("auth:ldap:index", migration);
    if (ldapIds.length > 0) {
      const first = ldapIds[0];
      const ldapRenames = [
        [`auth:ldap:${first}:enable`,   "authLdapEnable"],
        [`auth:ldap:${first}:url`,      "authLdapUrl"],
        [`auth:ldap:${first}:bindDn`,   "authLdapBindDn"],
        [`auth:ldap:${first}:password`, "authLdapPassword"],
        [`auth:ldap:${first}:baseDn`,   "authLdapBaseDn"],
      ];
      for (const [oldKey, newKey] of ldapRenames) {
        await renameKey(oldKey, newKey, now, migration);
      }
      
      await sequelize.query(
        `DELETE FROM "TirConfigs" WHERE key IN (:keys)`,
        {
          replacements: {
            keys: [
              `auth:ldap:${first}:label`,
              `auth:ldap:${first}:template`,
              `auth:ldap:${first}:ssl`,
              `auth:ldap:${first}:sslInsecure`,
              `auth:ldap:${first}:sslCa`,
            ],
          },
          transaction: migration,
        },
      );
     
      // Delete all additional providers
      for (const id of ldapIds.slice(1)) {
        await deleteAllForProvider(`auth:ldap:${id}`, migration);
      }
    }
    await sequelize.query(
      `DELETE FROM "TirConfigs" WHERE key = 'auth:ldap:index'`,
      { transaction: migration },
    );

    const oauthIds = await readIndex("auth:oauth:index", migration);
    for (const id of oauthIds) {
      await deleteAllForProvider(`auth:oauth:${id}`, migration);
    }
    await sequelize.query(
      `DELETE FROM "TirConfigs" WHERE key = 'auth:oauth:index'`,
      { transaction: migration },
    );

    await sequelize.query(
      `DELETE FROM "TirConfigs" WHERE key = 'auth:defaultLoginProvider'`,
      { transaction: migration },
    );

    await migration.commit();
  } catch (error) {
    await migration.rollback();
    throw error;
  }
};

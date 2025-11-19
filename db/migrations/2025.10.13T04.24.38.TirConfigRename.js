import { sequelize } from "../umzug.js";

const RENAMES = [
  { from: "auth_enable_local", to: "authLocalEnable" },
  { from: "auth_enable_ldap", to: "authLdapEnable" },
  { from: "auth_enable_oidc", to: "authOidcEnable" },

  { from: "auth_local_password_length", to: "authLocalPasswordLength" },
  { from: "auth_local_upper_count", to: "authLocalUpperCount" },
  { from: "auth_local_lower_count", to: "authLocalLowerCount" },
  { from: "auth_local_number_count", to: "authLocalNumberCount" },
  { from: "auth_local_special_count", to: "authLocalSpecialCount" },

  { from: "auth_ldap_url", to: "authLdapUrl" },
  { from: "auth_ldap_bind_dn", to: "authLdapBindDn" },
  { from: "auth_ldap_password", to: "authLdapPassword" },
  { from: "auth_ldap_base_dn", to: "authLdapBaseDn" },

  { from: "auth_oidc_url", to: "authOidcUrl" },
  { from: "auth_oidc_clientid", to: "authOidcClientId" },
  { from: "auth_oidc_secret", to: "authOidcSecret" },
  { from: "auth_oidc_callback", to: "authOidcCallback" },
  { from: "auth_oidc_group_mappings", to: "authOidcGroupMappings" },

  { from: "siteBanner_visible", to: "bannerSiteVisible" },
  { from: "siteBanner_html", to: "bannerSiteHtml" },
  { from: "siteBanner_color", to: "bannerSiteColor" },

  { from: "loginBanner_mode", to: "bannerLoginMode" },
  { from: "loginBanner_html", to: "bannerLoginHtml" },
  { from: "loginBanner_title", to: "bannerLoginTitle" },

  { from: "logger_zipArchive", to: "logZipArchive" },
  { from: "logger_syslogLogEnabled", to: "logSyslogLogEnabled" },
  { from: "logger_syslogTarget", to: "logSyslogTarget" },
  { from: "logger_syslogPort", to: "logSyslogPort" },
  { from: "logger_consoleLogLevel", to: "logConsoleLogLevel" },
  { from: "logger_syslogLogLevel", to: "logSyslogLogLevel" },

  { from: "notification_timeout", to: "notificationTimeout" },
];

export const up = async () => {
  const upMigration = await sequelize.transaction();

  try {
    for (const { from, to } of RENAMES) {
      await sequelize.query(
        `UPDATE "TirConfigs" SET key = :to WHERE key = :from AND NOT EXISTS (SELECT 1 FROM "TirConfigs" WHERE key = :to);`,
        { replacements: { from, to }, transaction: upMigration },
      );
    }
    await upMigration.commit();
  } catch (error) {
    await upMigration.rollback();
  }
};

export const down = async () => {
  const downMigration = await sequelize.transaction();

  try {
    for (const { from, to } of RENAMES) {
      await sequelize.query(
        `UPDATE "TirConfigs" SET key = :from WHERE key = :to AND NOT EXISTS (SELECT 1 FROM "Tirconfigs" WHERE key = :from);`,
        { replacements: { from, to }, transaction: downMigration },
      );
    }
    await downMigration.commit();
  } catch (error) {
    await downMigration.rollback();
  }
};

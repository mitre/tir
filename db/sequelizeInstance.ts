import { Sequelize, DataTypes, Model } from "sequelize";
import { DateTime } from "luxon";
import { buildDbConfigFromEnv } from "~/db/dbConfig";
import { createSequelize } from "~/db/createSequelize.js";
import { dbDebugEnabled } from "~/db/env.js";

const config = useRuntimeConfig();

declare module "sequelize" {
  interface ModelOptions<M extends Model = Model> {
    noIsoTimestamps?: boolean;
  }
}

const dbEnvConfig = {
  SQLITE: config.usesqlite,
  DATABASE_URL: config.database_url,
  DATABASE_NAME: config.database_name,
  DATABASE_USER: config.database_user,
  DATABASE_PASSWORD: config.database_password,
  DATABASE_HOST: config.database_host,
  DATABASE_PORT: config.database_port,
};
const dbConfig = buildDbConfigFromEnv(dbEnvConfig);

// .env is loaded by the db plugin after this module is evaluated, so check per query.
const logging = (msg: string) => {
  if (dbDebugEnabled()) console.debug("[database]", msg);
};

const sequelize =
  dbConfig.dialect === "sqlite"
    ? createSequelize(dbConfig, {
        logQueryParameters: true,
        logging,
        pool: { max: 1, min: 0, acquire: 30000, idle: 0 },
      })
    : createSequelize(dbConfig, { logging, pool: { max: 10, min: 0 } });

enableIsoTextTimestamps(sequelize);
export { sequelize };

export function enableIsoTextTimestamps(sequelize: Sequelize) {
  sequelize.addHook("beforeDefine", (attrs: any, options: any) => {
    if (options?.noIsoTimestamps === true) return;

    const nowISO = () => DateTime.now().toISO();
    attrs.creationDate ??= { type: DataTypes.TEXT, allowNull: false, defaultvalue: () => nowISO() };
    attrs.lastUpdate ??= { type: DataTypes.TEXT, allowNull: false, defaultValue: () => nowISO() };
  });
}

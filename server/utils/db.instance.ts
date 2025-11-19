import { Sequelize, DataTypes, Model, ModelStatic } from "sequelize";
import { DateTime } from "luxon";

const config = useRuntimeConfig();
let initSequelize;

declare module "sequelize" {
  interface ModelOptions<M extends Model = Model> {
    noIsoTimestamps?: boolean;
  }
}

const databasePort = ((n) => (isNaN(n) ? 5432 : n))(parseInt(config.database_port, 10));

if (config.usesqlite === "true") {
  initSequelize = new Sequelize({
    dialect: "sqlite",
    storage: "db/tirdb.sqlite",
    logQueryParameters: true,
    logging: (msg) => logger.debug({ service: "database", message: msg }),
  });
} else {
  initSequelize = new Sequelize({
    dialect: "postgres",
    database: config.database_name,
    username: config.database_user,
    password: config.database_password,
    host: config.database_host,
    port: databasePort,
    logging: (msg) => logger.debug({ service: "database", message: msg }),
    pool: { max: 10, min: 0 },
  });
}

export function enableIsoTextTimestamps(sequelize: Sequelize) {
  sequelize.addHook("beforeDefine", (attrs: any, options: any) => {
    if (options?.noIsoTimestamps === true) return;

    const nowISO = () => DateTime.now().toISO();
    attrs.creationDate ??= { type: DataTypes.TEXT, allowNull: false, defaultvalue: () => nowISO() };
    attrs.lastUpdate ??= { type: DataTypes.TEXT, allowNull: false, defaultValue: () => nowISO() };
  });
}

enableIsoTextTimestamps(initSequelize);
export const sequelize = initSequelize;

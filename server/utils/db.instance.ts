import { Sequelize } from "sequelize";

const config = useRuntimeConfig();
let initSequelize;

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

export const sequelize = initSequelize;

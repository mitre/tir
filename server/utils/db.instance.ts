import { Sequelize } from "sequelize";

const config = useRuntimeConfig();
let initSequelize;

if (config.usesqlite === "true") {
  initSequelize = new Sequelize({
    dialect: "sqlite",
    storage: "db/tirdb.sqlite",
    logging: false,
  });
} else {
  initSequelize = new Sequelize({
    dialect: "postgres",
    database: config.database_name,
    username: config.database_user,
    password: config.database_password,
    host: config.database_host,
    port: 5432, //config.database_port,
    // logging: msg => databaseLogger.info(msg),
    logging: false,
  });
}

export const sequelize = initSequelize;

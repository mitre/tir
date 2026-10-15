import { Sequelize } from "sequelize";

export function createSequelize(dbConfig, options = {}) {
  if (dbConfig.dialect === "sqlite") {
    return new Sequelize({ dialect: "sqlite", storage: dbConfig.storage, ...options });
  }
  return new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    host: dbConfig.host,
    port: dbConfig.port,
    ...options,
  });
}

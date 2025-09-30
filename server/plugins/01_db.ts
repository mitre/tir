import { DateTime } from "luxon";
import {
  AccessDeniedError,
  ConnectionAcquireTimeoutError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
  HostNotFoundError,
  HostNotReachableError,
  InvalidConnectionError,
  ConnectionError,
} from "sequelize";

export default defineNitroPlugin(async () => {
  try {
    const RETRY_ATTEMPTS = 5;
    const RETRY_DELAY_MS = 500;
    const RETRY_BACKOFF_FACTOR = 2;

    let currentRetryDelayMs = RETRY_DELAY_MS;

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        await sequelize.authenticate();
      } catch (err) {
        if (!(err instanceof Error)) {
          logger.emerg(`Unknown Error connecting to database.  Unknown error type.`);
        }

        if (!(err instanceof ConnectionError)) {
          logger.emerg({
            service: "DB",
            message: `Unknown DatabaseConnection Error. 
                  ${err}`,
          });

          throw err;
        }

        if (sequelize.getDialect() === "sqlite") {
          logger.emerg({ service: "DB", message: `Error Connecting to database` });
          throw err;
        }

        if (sequelize.getDialect() === "postgres") {
          if (err instanceof AccessDeniedError || err instanceof InvalidConnectionError) {
            logger.emerg({
              service: "DB",
              message: `Error connecting to database. ${err.name} ${err.message} ${err.cause}`,
            });
            throw err;
          }

          if (
            err instanceof ConnectionAcquireTimeoutError ||
            err instanceof ConnectionRefusedError ||
            err instanceof ConnectionTimedOutError ||
            err instanceof HostNotFoundError ||
            err instanceof HostNotReachableError
          ) {
            let retryMessage = `Retrying in ${currentRetryDelayMs}ms.`;
            if (attempt === RETRY_ATTEMPTS - 1) {
              retryMessage = "";
            }

            logger.alert({
              service: "DB",
              message: `Error connecting to database. (attempt ${attempt + 1}/${RETRY_ATTEMPTS}.
                  ${err.name}. ${err.message}
                  ${retryMessage}`,
            });

            if (attempt < RETRY_ATTEMPTS - 1) {
              await new Promise<void>((resolve) => setTimeout(resolve, currentRetryDelayMs));
            }

            currentRetryDelayMs = currentRetryDelayMs * RETRY_BACKOFF_FACTOR;
          }
        }
      }
    }

    await sequelize.addHook("beforeValidate", (model) => {
      if (!model.dataValues.creationDate) {
        model.dataValues.creationDate = "";
      }
      if (!model.dataValues.lastUpdate) {
        model.dataValues.lastUpdate = "";
      }
    });

    await sequelize.addHook("beforeCreate", (model) => {
      model.dataValues.creationDate = DateTime.now().toISO();
      model.dataValues.lastUpdate = DateTime.now().toISO();
    });

    await sequelize.addHook("beforeUpdate", (model) => {
      model.dataValues.lastUpdate = DateTime.now().toISO();
    });
    const { migrator, seeder } = await import("~/db/umzug.js");
    const pendingMigrations = await migrator.pending();
    if (pendingMigrations.length > 0) {
      logger.info({
        service: "database",
        message: `${pendingMigrations.length} Migrations Pending`,
      });
      logger.info({ service: "database", message: "Starting Migrations" });
      const migrateResults = await migrator.up();
      for (const migrationResult of migrateResults) {
        logger.info({
          service: "database",
          message: `Migrated: ${migrationResult.name}`,
        });
      }
      logger.info({ service: "database", message: `${migrateResults.length} Migrations Applied` });
    }

    const pendingSeeders = await seeder.pending();
    if (pendingSeeders.length > 0) {
      logger.info({
        service: "database",
        message: `${pendingSeeders.length} Seeds Pending`,
      });
      logger.info({ service: "database", message: "Starting Seeders" });
      const seederResults = await seeder.up();
      for (const seederResult of seederResults) {
        logger.info({
          service: "database",
          message: `Seeded: ${seederResult.name}`,
        });
      }
      logger.info({ service: "database", message: `${seederResults.length} Seeders Applied` });
    }

    logger.info({ service: "database", message: "Datatbase Started." });
  } catch (error) {
    console.log(error);
    logger.error({ service: "database", message: error });
  }
});

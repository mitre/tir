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
import { signalReady } from "../utils/startupSync";

export default defineNitroPlugin(async () => {
  try {
    const RETRY_ATTEMPTS = 5;
    const RETRY_DELAY_MS = 500;
    const RETRY_BACKOFF_FACTOR = 2;

    let currentRetryDelayMs = RETRY_DELAY_MS;
    let connected = false;

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        await sequelize.authenticate();
        connected = true;
        break;
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
    if (!connected) {
      throw new Error("Database connection failed after all retry attempts.");
    }

    const nowISO = () => DateTime.now().toISO();

    sequelize.addHook("beforeValidate", (model) => {
      if (!model.dataValues.creationDate) {
        model.dataValues.creationDate = "";
      }
      if (!model.dataValues.lastUpdate) {
        model.dataValues.lastUpdate = "";
      }
    });

    sequelize.addHook("beforeCreate", (model) => {
      const options = (model.constructor as any).options ?? {};
      if (options.noIsoTimestamps === true) return;
      const now = nowISO();
      model.dataValues.creationDate = now;
      model.dataValues.lastUpdate = now;
    });

    sequelize.addHook("beforeUpdate", (model) => {
      const options = (model.constructor as any).options ?? {};
      if (options.noIsoTimestamps === true) return;
      const hasLastUpdate = !!(model.constructor as any).rawAttributes?.lastUpdate;
      if (!hasLastUpdate) {
        const modelName = (model.constructor as any).name || "UnknownModel";
        logger.error({
          service: "database",
          message: `Global timestamp hook: 'lastUpdate' column missing on model '${modelName}'.`,
          details: {
            model: modelName,
            table: (model.constructor as any).getTableName?.(),
          },
        });
        return;
      }
      model.setDataValue("lastUpdate", nowISO());
    });

    sequelize.addHook("beforeBulkUpdate", (opts: any) => {
      const model = opts?.model as any;

      if (model?.options?.noIsoTimestamps) return;

      const hasLastUpdate = !!model?.rawAttributes?.lastUpdate;
      if (!hasLastUpdate) {
        logger.error({
          service: "sequelize",
          message: `Global timestamp hook: 'lastUpdate' column missing on bulk update model '${
            model?.name ?? "UnknownModel"
          }'.`,
          details: { table: model?.getTableName?.(), operation: "beforeBulkUpdate" },
        });
        return;
      }

      opts.attributes = {
        ...(opts.attributes || {}),
        lastUpdate: nowISO(),
      };
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

    logger.info({ service: "database", message: "Database Started." });
    signalReady("db");
  } catch (error) {
    console.log(error);
    logger.error({ service: "database", message: error });
  }
});

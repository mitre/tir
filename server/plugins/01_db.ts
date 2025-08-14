import { DateTime } from "luxon";
import * as dbModels from "../../db/models";
import { migrator, seeder } from "~/db/umzug.js";

export default defineNitroPlugin(async () => {
  try {
    dbModels.UserRole.init;
    await sequelize.authenticate();

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

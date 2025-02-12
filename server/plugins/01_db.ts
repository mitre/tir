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
    
    const migrateResults = await migrator.up();
    const seederResults = await seeder.up();
    
    logger.info({ service: "database", message: "Datatbase Started." });
  } catch (error) {
    console.log(error);
    logger.error({ service: "database", message: error });
  }
});

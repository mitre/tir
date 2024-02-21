import { DateTime } from "luxon";
import * as dbModels from "../../db/models";
import { databaseLogger } from "../utils/logger";

export default defineNitroPlugin(async () => {
  try {
    dbModels.UserRole.init;
    await sequelize.authenticate();

    sequelize.addHook("beforeValidate", (model) => {
      if (!model.dataValues.creationDate) {
        model.dataValues.creationDate = "";
      }
      if (!model.dataValues.lastUpdate) {
        model.dataValues.lastUpdate = "";
      }
    });

    sequelize.addHook("beforeCreate", (model) => {
      model.dataValues.creationDate = DateTime.now().toISO();
      model.dataValues.lastUpdate = DateTime.now().toISO();
    });

    sequelize.addHook("beforeUpdate", (model) => {
      model.dataValues.lastUpdate = DateTime.now().toISO();
    });

    // await sequelize.sync({ alter: true });
    databaseLogger.info("Datatbase Started.");
  } catch (error) {
    console.log(error);
  }
});

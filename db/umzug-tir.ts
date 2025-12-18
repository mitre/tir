import path from "node:path";
import fs from "node:fs";
import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "./sequelizeInstance";

export const migrator = new Umzug({
  migrations: {
    glob: ["db/migrations/*.js"],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger,
  create: {
    folder: path.resolve(process.cwd(), "db/migrations"),
    template: (filepath) => {
      const templatePath = path.resolve(process.cwd(), "db/templates/sample-migration.js");
      return [[filepath, fs.readFileSync(templatePath).toString()]];
    },
  },
});

export const seeder = new Umzug({
  migrations: {
    glob: ["db/seeders/*.js"],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    modelName: "seeder_meta",
  }),
  logger,
  create: {
    folder: "db/seeders",
    template: (filepath) => [
      [
        filepath,
        fs.readFileSync(path.join(process.cwd(), "db/templates/sample-seeder.js")).toString(),
      ],
    ],
  },
});

import { Sequelize } from "sequelize";
import { CciReference } from "../../../db/models";

export default defineEventHandler(async () => {
  const series = await CciReference.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("title")), "title"]],
  });

  return series;
});

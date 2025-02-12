import { Sequelize } from "sequelize";
import { CciReference } from "../../../db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);
  const series = await CciReference.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("title")), "title"]],
  });

  return series;
});

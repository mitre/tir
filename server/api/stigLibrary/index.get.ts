import { fn, col, cast } from "sequelize";
import { StigLibrary, Stig } from "../../../db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);
  const libraries = await StigLibrary.findAll({
    attributes: {
      include: [[cast(fn("COUNT", col("Stigs.id")), "integer"), "stigCount"]],
    },
    include: [{ model: Stig, attributes: [], through: { attributes: [] } }],
    group: ["StigLibrary.id"],
  });
  return libraries;
});

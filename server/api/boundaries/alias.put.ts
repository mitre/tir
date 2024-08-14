import { TirAlias } from "../../../db/models/tirAlias";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tirAlias = await TirAlias.findOne({
    where: {
      term: "Boundary",
    },
  });
  if (body.Boundary) {
    tirAlias?.setDataValue("alias", body.Boundary);
  }

  tirAlias?.save();

  const tirAlia = await TirAlias.findOne({
    where: {
      term: "Tier",
    },
  });
  if (body.Tier) {
    tirAlia?.setDataValue("alias", body.Tier);
  }

  tirAlia?.save();

  return { tirAlias, tirAlia };
});

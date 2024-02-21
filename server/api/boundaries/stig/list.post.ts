import { System, Stig, SystemWithStigs } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const systems = (await System.findAll({
    where: {
      BoundaryId: body.BoundaryId,
    },
    include: {
      model: Stig,
    },
  })) as SystemWithStigs[];

  const ids = [...new Set(systems.flatMap((obj) => obj.Stigs.map((stig) => stig.dataValues.id)))];

  const stigs = await Stig.findAll({
    where: {
      id: ids,
    },
  });

  return stigs;
});

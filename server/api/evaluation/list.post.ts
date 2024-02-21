import { System, Stig, Boundary } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const stigs = await Stig.findAll({
    attributes: ["id", "title"],
    include: [
      {
        model: System,
        attributes: ["id", "name"],
        required: true,
        include: [
          {
            model: Boundary,
            attributes: ["id", "name"],
            required: true,
            where: { id: body.BoundaryId },
          },
        ],
      },
    ],
  });

  return stigs;
});

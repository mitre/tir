import { Boundary, StigLibrary, System, User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const boundary = await Boundary.findAll({
    where: [{ TierId: body.TierId }],
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["email"],
      },
      {
        model: StigLibrary,
        attributes: ["id", "filename"],
      },
    ],
  });

  for (let index = 0; index < boundary.length; ++index) {
    const count = await System.findAndCountAll({
      where: { BoundaryId: boundary[index].dataValues["id"] },
    });
    boundary[index].dataValues["systemCount"] = count.count;
  }

  return boundary;
});

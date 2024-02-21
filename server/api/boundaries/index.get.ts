import { Boundary } from "../../../db/models/boundary";
import { System } from "../../../db/models/system";
import { User } from "../../../db/models/user";

export default defineEventHandler(async () => {
  const boundary = await Boundary.findAll({
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["email"],
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

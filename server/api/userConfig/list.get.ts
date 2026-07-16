import { DateTime } from "luxon";
import { Boundary, UserConfig, Tier } from "../../../db/models";

export default defineEventHandler(async (event) => {
  // const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  return await UserConfig.findOne({
    where: {
      UserId: checkResult.user.id,
    },
    include: [
      {
        model: Tier,
        as: "FavoriteTiers",
      },
      {
        model: Boundary,
        as: "FavoriteBoundaries",
      },
    ],
  });
});

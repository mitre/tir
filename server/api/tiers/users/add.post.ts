import { User, Tier, TierInterface } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await User.findByPk(body.UserId);
  const tier = (await Tier.findByPk(body.TierId)) as TierInterface;

  if (!user || !tier) {
    if (!user) {
      return {
        success: false,
        error: "Unable to find UserId",
        id: body.UserId,
      };
    } else {
      return {
        success: false,
        error: "Unable to find TierId",
        id: body.TierId,
      };
    }
  }
  await tier.addUser(user, { through: { TierRoleId: body.TierRoleId } });

  return { success: true };
});

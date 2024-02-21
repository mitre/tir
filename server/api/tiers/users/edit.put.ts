import { Tier_User } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tier_user = await Tier_User.findOne({
    where: { TierId: body.TierId, UserId: body.UserId },
  });
  tier_user?.setDataValue("TierRoleId", body.TierRoleId);
  tier_user?.save();
  return tier_user;
});

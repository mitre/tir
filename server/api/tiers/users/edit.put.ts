import { User, Tier_User, Tier, TierInterface, TierRole } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tier = (await Tier.findByPk(body.TierId)) as TierInterface;
  const user = await User.findByPk(body.UserId);
  const role = await TierRole.findByPk(body.TierRoleId);
  const tier_user = await Tier_User.findOne({
    where: { TierId: body.TierId, UserId: body.UserId },
  });

  tier_user?.setDataValue("TierRoleId", body.TierRoleId);
  tier_user?.save();
  logger.info({
    service: "Tiers",
    message: `${tier?.name}: user ${user?.email} role updated to: ${role?.name}`,
  });
  return tier_user;
});

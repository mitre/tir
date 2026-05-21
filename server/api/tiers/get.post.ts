import { Tier, Tier_User, User, UserRole, TierRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.id);

  const tier = await Tier.findAll({ where: { id: body.id } });
  // console.log("Tier", tier);

  if (tier.length > 0) {
    if (checkResult.UserRoleId !== 1 && !checkResult.TierRoleId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Permission Not Granted. Not a member of this Company",
      });
    }
  }

  return tier;
});

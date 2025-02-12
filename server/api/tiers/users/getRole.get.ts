import { TierRole } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId) {
    const tierRole = await TierRole.findAll();

    return tierRole;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

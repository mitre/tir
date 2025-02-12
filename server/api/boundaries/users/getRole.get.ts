import { BoundaryRole } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId) {
    const boundaryRole = await BoundaryRole.findAll();
    return boundaryRole;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "User not Permitted.",
    });
  }
});

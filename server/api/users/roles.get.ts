import { UserRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const roles = await UserRole.findAll();

  return roles;
});

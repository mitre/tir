import { UserRole } from "../../../db/models";

export default defineEventHandler(async () => {
  const roles = await UserRole.findAll();

  return roles;
});

import { UserRole } from "../../../db/models";
import { User } from "../../../db/models/user";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const users = await User.findAll({
    attributes: ["id", "firstName", "lastName", "email", "UserRoleId", "TimezoneId"],
    include: [
      {
        model: UserRole,
      },
    ],
  });
  return users;
});

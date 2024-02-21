import { User, Timezone } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await User.findByPk(body.id);

  if (body.firstName) {
    user?.setDataValue("firstName", body.firstName);
  }

  if (body.lastName) {
    user?.setDataValue("lastName", body.lastName);
  }

  if (body.email) {
    user?.setDataValue("email", body.email);
  }

  if (body.UserRoleId) {
    user?.setDataValue("UserRoleId", body.UserRoleId);
  }

  if (body.timezone) {
    try {
      const timezone = await Timezone.findOne({ where: { name: body.timezone } });

      if (!timezone) {
        console.error(`Timezone with name ${body.timezone} not found.`);
        return;
      }

      user?.setDataValue("TimezoneId", timezone.id);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  }

  if (body.ThemeId) {
    user?.setDataValue("ThemeId", body.ThemeId);
  }

  user?.save();
  if (user) {
    delete user.dataValues.password;
  }

  return user;
});

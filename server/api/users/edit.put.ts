import { User, Timezone } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await User.findByPk(body.id, { attributes: { exclude: ["password", "salt"] } });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  const orginalUser = user.email;

  if (body.email) {
    if (body.email !== user?.email) {
      const userExist = await User.findOne({ where: body.email });
      if (userExist) {
        logger.error(`Sorry, this email is taken ${body.email}`);
        throw createError({
          statusCode: 409,
          statusMessage: "Sorry, this email is taken",
        });
      }
      user.email = body.email;
    } else {
      delete body.email;
    }
  }

  if (body.firstName && user.firstName !== body.firstName) {
    user.firstName = body.firstName;
  } else {
    delete body.firstName;
  }

  if (body.lastName && user.lastName !== body.lastName) {
    user.lastName = body.lastName;
  } else {
    delete body.lastName;
  }

  if (body.UserRoleId && user.UserRoleId !== body.UserRoleId) {
    user.UserRoleId = body.UserRoleId;
  } else {
    delete body.UserRoleId;
  }

  if (body.ThemeId && user.ThemeId !== body.ThemeId) {
    user.ThemeId = body.ThemeId;
  } else {
    delete body.ThemeId;
  }

  if (body.timezone) {
    try {
      const timezone = await Timezone.findOne({ where: { name: body.timezone } });
      if (!timezone) {
        console.error(`Timezone with name ${body.timezone} not found.`);
        return;
      } else if (timezone.id !== user.TimezoneId) {
        user.TimezoneId = timezone.id;
      } else {
        delete body.timezone;
      }
    } catch (error) {
      console.error("Error editing user:", error);
    }
  }

  user.save();

  const attributes = Object.keys(body).filter((key) => key !== "id");
  const attributesString = attributes.join(", ");

  logger.info({
    service: "auth",
    message: `Edited User ${orginalUser}: ${attributesString}`,
  });

  return user;
});

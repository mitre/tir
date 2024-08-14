import { User, Timezone, UserRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { firstName, lastName, email, UserRoleId, TimezoneName } = body;

  // check if user exist
  const userExist = await User.findOne({ where: { email } });
  if (userExist) {
    logger.error(`Sorry, this email is taken ${body.email}`);
    throw createError({
      statusCode: 409,
      statusMessage: "Sorry, this email is taken",
    });
  }
  const userRole = await UserRole.findByPk(UserRoleId);
  let newUser: User | null = null;

  try {
    // Find the timezone with the specified name
    let timezone;

    if (TimezoneName) {
      timezone = await Timezone.findOne({ where: { name: TimezoneName } });
    } else {
      timezone = await Timezone.findOne({ where: { name: "Etc/UTC" } });
    }

    if (!timezone) {
      console.error(`Timezone with name ${TimezoneName} not found.`);
      logger.error(`Timezone with name ${TimezoneName} not found.`);
      return;
    }

    // Now create the user and associate it with the timezone using the found ID
    newUser = await User.create({
      firstName,
      lastName,
      email,
      UserRoleId,
      TimezoneId: timezone.id,
    });
    logger.info({
      service: "auth",
      message: `User ${email} Successfully Created with Role: ${userRole?.name}`,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    logger.error(`Error creating user:${error}`);
  }

  return newUser;
});

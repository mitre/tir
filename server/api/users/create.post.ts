import { User, Timezone } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { firstName, lastName, email, UserRoleId, TimezoneName } = body;

  // check if user exist
  const userExist = await User.findOne({ where: { email: body.email } });
  if (userExist) {
    throw createError({
      message: "Sorry, this email is taken",
    });
  }

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
      return;
    }

    // Now create the user and associate it with the timezone using the found ID
    await User.create({
      firstName,
      lastName,
      email,
      UserRoleId,
      TimezoneId: timezone.id,
    });
  } catch (error) {
    console.error("Error creating user:", error);
  }

  return `User ${firstName} ${lastName} created successfully`;
});

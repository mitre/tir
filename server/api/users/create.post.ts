import { DateTime } from "luxon";
import { User, Timezone, UserRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { firstName, lastName, email, UserRoleId, TimezoneName } = body;
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId !== 1) {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }

  if (!body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email required.",
    });
  }
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

  const violations = await getPasswordViolations(body.password);
  if (violations.length > 0) {
    logger.info({
      service: "Auth",
      message: `Password validation failed for creating new user ${body.email}: ${violations.join(
        "; ",
      )}`,
    });

    throw createError({
      statusCode: 400,
      statusMessage: violations.join(" "),
    });
  }

  const config = useRuntimeConfig();

  if (!config.secret_key) {
    throw new Error("secret_key is not set.");
  }

  const SECRET_KEY = config.secret_key as string;
  const salt = generateSalt();

  const password = hashPassword(body.password, salt, SECRET_KEY);

  await User.create({
    firstName,
    lastName,
    email,
    UserRoleId,
    TimezoneId: timezone.id,
    salt,
    password,
    passwordChangedAt: DateTime.now().toISO(),
    creationMethod: "local",
  });

  logger.info({
    service: "auth",
    message: `User ${email} Successfully Created with Role: ${userRole?.name}`,
  });

  return newUser;
});

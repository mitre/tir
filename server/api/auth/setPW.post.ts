import { DateTime } from "luxon";
import { User } from "../../../db/models";
import { generateSalt, hashPassword } from "~/server/utils/hash";
import { getPasswordViolations } from "~/server/utils/password";

const config = useRuntimeConfig();

if (!config.secret_key) {
  throw new Error("secret_key is not set.");
}

const SECRET_KEY = config.secret_key as string;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  const isAdmin = checkResult.UserRoleId === 1;
  const isSelf = checkResult.user?.email === body.email;

  if (!isAdmin && !isSelf) {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }

  const user = await User.findOne({ where: { email: body.email } });
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const violations = await getPasswordViolations(body.password);
  if (violations.length > 0) {
    logger.info({
      service: "Auth",
      message: `Password set validation failed for user ${user.email}: ${violations.join("; ")}`,
    });

    throw createError({
      statusCode: 400,
      statusMessage: violations.join(" "),
    });
  }

  if (user.salt === null) {
    user.salt = generateSalt();
  }

  user.password = hashPassword(body.password, user.salt, SECRET_KEY);
  user.passwordChangedAt = DateTime.now().toISO();

  await user.save();

  logger.info({
    service: "Auth",
    message: `Password successfully set for user ${user.email}`,
  });

  return { success: true };
});

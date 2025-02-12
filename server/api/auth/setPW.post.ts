import { DateTime } from "luxon";
import { User } from "../../../db/models";
import { generateSalt, hashPassword } from "~/server/utils/hash";

const config = useRuntimeConfig();

if (!config.secret_key) {
  throw new Error("secret_key is not set.");
}

const SECRET_KEY = config.secret_key as string;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId === 1 || checkResult.user?.email === body.email) {
    const email = body.email;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unknown User.",
      });
    }

    if (user.salt === null) {
      user.salt = generateSalt();
    }
    const hashPW = hashPassword(body.password, user.salt, SECRET_KEY);

    user.password = hashPW;
    user.passwordChangedAt = DateTime.now().toISO();

    await user.save();
    logger.info({
      service: "auth",
      message: `Password Successfully Set for User ${user?.email} `,
    });
    return { success: true };
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

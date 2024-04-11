import jwt from "jsonwebtoken";
import { User } from "../../../../db/models";
<<<<<<< HEAD
import { verifyPassword } from "~/server/utils/hash";
=======
>>>>>>> main

const config = useRuntimeConfig();

if (!config.jwt_key) {
  throw new Error("jwt_key is not set.");
}

if (!config.secret_key) {
  throw new Error("secret_key is not set.");
}

const JWT_KEY = config.jwt_key as string;
const SECRET_KEY = config.secret_key as string;

export default defineEventHandler(async (event) => {
  console.log("entered local flow");
  const body = await readBody(event);
  const email = body.email;
  const password = body.password;

  console.log("entered local flow");
  const user = await User.findOne({ where: { email } });
  if (!user) {
    logger.info({
      service: "auth",
      message: `Unsuccessful login attempt.  Unknown user: ${email}`,
    });
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User",
    });
  }
  const validPassword = verifyPassword(password, user.password, user.salt, SECRET_KEY);

  if (!validPassword) {
    logger.info({ service: "auth", message: `Unsuccessful login attempt.  User: ${email}` });
    throw createError({
      statusCode: 401,
      statusMessage: "Bad Password",
    });
  }
  logger.info({ service: "auth", message: `Successful login.  User: ${email}` });
  const cookieName = "tirtoken";
  setCookie(event, cookieName, jwt.sign({ userId: user.id }, JWT_KEY, { expiresIn: "2h" }), {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: false, // process.env.NODE_ENV === "production",
    // expires: new Date(Date.now() + '2h'),
  });

  const results = {
    token: jwt.sign({ userId: user.id }, JWT_KEY, { expiresIn: "2h" }),
    userId: user.id,
  };

  return results;
});

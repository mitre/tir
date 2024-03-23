import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../../../db/models";

const config = useRuntimeConfig();

if (!config.jwt_key) {
  throw new Error("jwt_key is not set.");
}

const SECRET_KEY = config.jwt_key as string;

export default defineEventHandler(async (event) => {
  console.log("entered local flow");
  const body = await readBody(event);
  const email = body.email;
  const password = body.password;

  console.log("entered local flow");
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log("couldn't find user");
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User",
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    console.log("invalid password");
    throw createError({
      statusCode: 401,
      statusMessage: "Bad Password",
    });
  }

  const cookieName = "tirtoken";
  setCookie(event, cookieName, jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "2h" }), {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: false, // process.env.NODE_ENV === "production",
    // expires: new Date(Date.now() + '2h'),
  });

  const results = {
    token: jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "2h" }),
    userId: user.id,
  };

  return results;
});

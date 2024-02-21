import bcrypt from "bcryptjs";
import { User } from "../../../db/models";

const config = useRuntimeConfig();

if (!config.jwt_key) {
  throw new Error("jwt_key is not set.");
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }
  const hashPW = await bcrypt.hash(body.password, 10);

  user.password = hashPW;
  await user.save();

  return { sucesss: true };
});

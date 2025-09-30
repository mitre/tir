import { tokenToString } from "typescript";
import { Token } from "../../../../db/models/index";

export default defineEventHandler(async (event) => {
  // const body = await readBody(event);
  const params = getQuery(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.user.id === params.UserId) {
    const tokens = await Token.findAll({
      where: { UserId: params.UserId },
    });
    return tokens;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

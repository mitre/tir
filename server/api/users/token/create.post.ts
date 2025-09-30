import { Token, User } from "../../../../db/models";
import { createToken } from "../../../utils/token";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.user.id === body.UserId) {
    const user = await User.findByPk(body.UserId);
    const buildToken = createToken();
    const newToken = await Token.build();
    newToken.dataValues.token = buildToken;
    newToken.dataValues.UserId = body.UserId;
    newToken.dataValues.date = body.date;
    newToken.dataValues.name = body.name;
    newToken.save();
    logger.info({
      service: "Token",
      message: `${user?.email} Successfully Created Token: ${newToken.name}`,
    });
    return { token: buildToken, name: body.name };
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

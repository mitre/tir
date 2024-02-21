import { Token } from "../../../../db/models/index";
import { createToken } from "../../../utils/token";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const buildToken = createToken();
  const newToken = await Token.build();
  newToken.dataValues.token = buildToken;
  newToken.dataValues.UserId = body.UserId;
  newToken.dataValues.date = body.date;
  newToken.dataValues.name = body.name;
  newToken.save();
  return { token: buildToken, name: body.name };
});

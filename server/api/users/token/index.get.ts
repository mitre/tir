import { tokenToString } from "typescript";
import { User, Token } from "../../../../db/models/index";

export default defineEventHandler(async (event) => {
  // const body = await readBody(event);
  const params = getQuery(event);
  const tokens = await Token.findAll({
    where: { UserId: params.UserId },
  });
  return tokens;
});

import inflection from "inflection";
import { TirAlias } from "../../../db/models/tirAlias";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId === 1) {
    if (body) {
      const currentAliases = await TirAlias.findAll();
      const terms = currentAliases.map((tirAlias) => tirAlias.term);

      const keys = Object.keys(body);

      for (const key of keys) {
        if (body[key] && terms.includes(key)) {
          await TirAlias.update(
            { alias: inflection.singularize(inflection.capitalize(body[key])) },
            { where: { term: key } },
          );
        }
      }
    }
    return await TirAlias.findAll();
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});

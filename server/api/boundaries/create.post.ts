import { DateTime } from "luxon";
import { Boundary, BoundaryInterface, Tier, Tier_User, User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.TierId);

  if (checkResult.TierRoleId) {
    if (checkResult.TierRoleId === 4) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to create Boundaries",
      });
    } else {
      body.lastUpdate = DateTime.now().toISO();
      try {
        const boundary = (await Boundary.create(body)) as BoundaryInterface;
        await boundary.addUser(checkResult.user, { through: { BoundaryRoleId: 1 } });
        return boundary;
      } catch (err) {
        const existingBoundary = await Boundary.findOne({ where: { name: body.name } });
        const tier = await Tier.findByPk(existingBoundary?.TierId);
        throw createError({
          statusCode: 401,
          statusMessage: `Boundary with this name already exists in ${tier?.name} `,
        });
      }
    }
  } else if (body.TierId === null) {
    throw createError({
      statusCode: 401,
      statusMessage: "Create your Boundary in an existing Company",
    });
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Company",
    });
  }
});

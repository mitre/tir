import { Tier, TierInterface, Tier_User, User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.parentId);

  if (checkResult.UserRoleId === 2 && checkResult.TierRoleId) {
    if (checkResult.TierRoleId === 4) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to create Companies",
      });
    } else {
      try {
        const tier = (await Tier.create(body)) as TierInterface;
        await tier.addUser(checkResult.user, { through: { TierRoleId: 1 } });
        return tier;
      } catch (err) {
        const existingCompany = await Tier.findOne({ where: { name: body.name } });
        if (existingCompany?.parentId === null) {
          throw createError({
            statusCode: 401,
            statusMessage: `Company with this name already exists on the Home page `,
          });
        } else {
          const tier = await Tier.findByPk(existingCompany?.parentId);
          throw createError({
            statusCode: 401,
            statusMessage: `Company with this name already exists in ${tier?.name} `,
          });
        }
      }
    }
  } else if (body.parentId === null) {
    try {
      const tier = (await Tier.create(body)) as TierInterface;
      await tier.addUser(checkResult.user, { through: { TierRoleId: 1 } });
      return tier;
    } catch (err) {
      const existingCompany = await Tier.findOne({ where: { name: body.name } });
      if (existingCompany?.parentId === null) {
        throw createError({
          statusCode: 401,
          statusMessage: `Company with this name already exists on the Home page `,
        });
      } else {
        const tier = await Tier.findByPk(existingCompany?.parentId);
        throw createError({
          statusCode: 401,
          statusMessage: `Company with this name already exists in ${tier?.name} `,
        });
      }
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Company",
    });
  }
});

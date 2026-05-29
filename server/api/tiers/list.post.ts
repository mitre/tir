import { Tier, Tier_User, User, UserRole, TierRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, body.parentId);
  if (checkResult.TierRoleId || body.parentId === null || checkResult.UserRoleId === 1) {
    const tierList = await Tier.findAll({
      where: { parentId: body.parentId },
      include: [
        {
          model: Tier,
          as: "parent",
        },
        {
          model: Tier_User,
          include: [
            {
              model: User,
              attributes: ["email"],
            },
          ],
        },
        {
          model: Tier_User,
          include: [
            {
              model: User,
              attributes: ["email"],
            },
          ],
        },
      ],
    });
    for (let i = 0; i < tierList.length; i++) {
      if (tierList[i].dataValues.parent !== null) {
        const list = await Tier.findByPk(tierList[i].dataValues.parent.dataValues.id, {
          include: [
            {
              model: Tier_User,
              include: [
                {
                  model: User,
                  attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                  model: TierRole,
                },
              ],
            },
          ],
        });
        if (checkResult.UserRoleId !== 1 && !checkResult.TierRoleId) {
          throw createError({
            statusCode: 401,
            statusMessage: "Permission Not Granted. Not a member of this Company",
          });
        }
      }
    }

    return tierList;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Company",
    });
  }
});

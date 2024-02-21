import { Tier, Tier_User, User, UserRole, TierRole } from "../../../db/models";
import { decodeToken } from "../../utils/currentUser";

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, "tirtoken");
  let userId: number;
  if (rawToken) {
    userId = decodeToken(rawToken);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const user = await User.findByPk(userId, {
    attributes: [],
    include: [
      {
        model: UserRole,
        attributes: ["id", "name"],
      },
    ],
  });
  const body = await readBody(event);
  const tierList = await Tier.findAll({
    where: { parentId: body.parentId },
    include: [
      {
        model: Tier,
        as: "parent",
      },
    ],
  });
  for (let i = 0; i < tierList.length; i++) {
    if (tierList[i].dataValues.parent !== null) {
      // console.log("Parent ID:", tierList[i].dataValues.parent.dataValues.id);
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
          {
            model: User,
            attributes: ["id", "firstName", "lastName", "email"],
            as: "owner",
          },
        ],
      });
      // console.log(tierList);
      if (
        tierList[0].dataValues.parent.dataValues.ownerId !== userId &&
        user?.dataValues.UserRole.dataValues.name !== "Admin" &&
        list?.dataValues.Tier_Users.findIndex((o: { UserId: number }) => o.UserId === userId) === -1
      ) {
        throw createError({
          statusCode: 401,
          statusMessage: "Permission Not Granted. Not a member of this Company",
        });
      }
    }
  }

  return tierList;
});

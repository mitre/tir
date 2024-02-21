import { Tier, TierRole, User, Tier_User } from "../../../../db/models";
import jwt from "jsonwebtoken";

export default defineEventHandler<{ query: { TierId: string } }>(async (event) => {
  type TierMemberUser = {
    UserId: number;
    TierId: number;
    TierRoleId: number;
    User: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    TierRole: {
      id: number;
      name: string;
    };
  };

  const query = getQuery(event);

  const rawToken = getCookie(event, "tirtoken");
  const config = useRuntimeConfig();

  const decodedToken = jwt.verify(rawToken!, config.jwt_key) as { [key: string]: any };

  if (query.TierId === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing TierId",
    });
  }

  const user = await User.findOne({
    where: {
      id: decodedToken.userId,
    },
  });

  const list = await Tier.findByPk(query.TierId, {
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

  // const foundBoundaryMember = list?.dataValues.Tier_Users.find(
  //   (user: TierMemberUser) => user.UserId === decodedToken.userId,
  // );

  // if (
  //   !(
  //     foundBoundaryMember?.TierRoleId === 1 ||
  //     list?.dataValues.ownerId === decodedToken.userId ||
  //     user?.dataValues.UserRoleId === 1
  //   )
  // ) {
  //   return {
  //     Tier_Users: [
  //       {
  //         UserId: 1,
  //         TierRoleId: 2,
  //         User: {
  //           id: 1,
  //           firstName: "Insufficient",
  //           lastName: "Permissions",
  //           email: "",
  //         },
  //         TierRole: {
  //           id: 1,
  //           name: "Insufficient",
  //         },
  //       },
  //     ],
  //     owner: {
  //       id: 1,
  //       firstName: "Insufficient",
  //       lastName: "Permissions",
  //       email: "",
  //     },
  //   };
  // }

  return list;
});

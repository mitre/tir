import jwt from "jsonwebtoken";
import { User, Boundary, BoundaryRole, Boundary_User } from "../../../../db/models";

export default defineEventHandler<{ query: { BoundaryId: string } }>(async (event) => {
  type BoundaryMemberUser = {
    UserId: number;
    BoundaryId: number;
    BoundaryRoleId: number;
    User: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    BoundaryRole: {
      id: number;
      name: string;
    };
  };

  const query = getQuery(event);

  const rawToken = getCookie(event, "tirtoken");
  const config = useRuntimeConfig();

  const decodedToken = jwt.verify(rawToken!, config.jwt_key) as { [key: string]: any };

  if (query.BoundaryId === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing BoundaryId",
    });
  }

  const user = await User.findOne({
    where: {
      id: decodedToken.userId,
    },
  });

  const list = await Boundary.findByPk(query.BoundaryId, {
    include: [
      {
        model: Boundary_User,
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: BoundaryRole,
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

  // const foundBoundaryMember = list?.dataValues.Boundary_Users.find(
  //   (user: BoundaryMemberUser) => user.UserId === decodedToken.userId,
  // );

  // if (
  //   !(
  //     foundBoundaryMember?.BoundaryRoleId === 1 ||
  //     list?.dataValues.ownerId === decodedToken.userId ||
  //     user?.dataValues.UserRoleId === 1
  //   )
  // ) {
  //   return {
  //     Boundary_Users: [
  //       {
  //         UserId: 1,
  //         BoundaryRoleId: 2,
  //         User: {
  //           id: 1,
  //           firstName: "Insufficient",
  //           lastName: "Permissions",
  //           email: "",
  //         },
  //         BoundaryRole: {
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

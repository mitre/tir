import { DateTime } from "luxon";
import { InferAttributes } from "sequelize";
import { Boundary, User, UserRole, Boundary_User } from "../../../db/models";

type UpdateBoundaryRequest = {
  id: number;
  name?: string;
  ownerId?: number;
  TierId?: number;
  StigLibraryId?: number;
  PolicyDocumentId?: number;
  ClassificationId?: number;
  cavaets?: string;
};

export default defineEventHandler(async (event) => {
  const body: UpdateBoundaryRequest = await readBody(event);

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

  if (!body.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required parameter: id.",
    });
  }

  const boundary = await Boundary.findByPk(body.id, {
    include: [
      {
        model: Boundary_User,
      },
    ],
  });

  if (!boundary) {
    throw createError({
      statusCode: 404,
      statusMessage: `No Boundary foound for id: ${body.id}.`,
    });
  }

  boundary.lastUpdate = DateTime.now().toISO();

  const attributesToUpdate: Array<keyof InferAttributes<Boundary>> = [
    "name",
    "ownerId",
    "StigLibraryId",
    "TierId",
    "StigLibraryId",
    "PolicyDocumentId",
    "ClassificationId",
    "caveats",
  ];

  if (boundary?.dataValues.ownerId !== userId && user?.dataValues.UserRole.id !== 1) {
    if (boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)) {
      if (
        boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)
          .BoundaryRoleId === 1
      ) {
        attributesToUpdate.forEach((attr) => {
          const value = body[attr as keyof UpdateBoundaryRequest];
          if (value !== undefined) {
            boundary.setDataValue(attr, value);
          }
        });

        boundary.save();
        return boundary;
      } else {
        throw createError({
          statusCode: 401,
          statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to Edit.",
        });
      }
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to Edit.",
      });
    }
  } else {
    attributesToUpdate.forEach((attr) => {
      const value = body[attr as keyof UpdateBoundaryRequest];
      if (value !== undefined) {
        boundary.setDataValue(attr, value);
      }
    });

    boundary.save();
    return boundary;
  }
});

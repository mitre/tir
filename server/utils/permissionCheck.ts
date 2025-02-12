import { Op } from "sequelize";
import {
  EvaluationItem,
  System,
  Milestone,
  Boundary,
  User,
  Boundary_User,
  NessusPlugin_Boundary,
  BoundaryRole,
  Tier,
  Tier_User,
} from "../../db/models";

export async function userCheck(
  event: any,
  systemId?: string,
  boundaryId?: string,
  tierId?: string,
) {
  let userId: number;
  let BoundaryRoleId = null;
  let TierRoleId = null;
  let boundary = null;
  const rawToken = getCookie(event, "tirtoken");
  if (rawToken) {
    userId = decodeToken(rawToken);
  } else {
    console.log("error 1");
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    console.log("error 2");
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  if (boundaryId) {
    boundary = await Boundary.findByPk(boundaryId, {
      attributes: ["id", "name"],
      include: [
        {
          model: Boundary_User,
        },
      ],
    });
  } else if (systemId) {
    const system = await System.findByPk(systemId);
    if (system) {
      boundary = await Boundary.findByPk(system.BoundaryId, {
        attributes: ["id", "name"],
        include: [
          {
            model: Boundary_User,
          },
        ],
      });
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: "Unknown System.",
      });
    }
  }
  if (tierId) {
    const tier = await Tier.findByPk(tierId, {
      include: [
        {
          model: Tier_User,
        },
      ],
    });
    if (tier) {
      const tierMember = tier?.dataValues.Tier_Users.find(
        (o: { UserId: number }) => o.UserId === userId,
      );
      if (tierMember) {
        TierRoleId = tierMember.TierRoleId;
      }
    }
  }

  if (boundary) {
    const boundaryMember = boundary?.dataValues.Boundary_Users.find(
      (o: { UserId: number }) => o.UserId === userId,
    );
    if (boundaryMember) {
      BoundaryRoleId = boundaryMember.BoundaryRoleId;
    }
  }

  const checkResults = { user, UserRoleId: user?.UserRoleId, BoundaryRoleId, TierRoleId };
  return checkResults;
}

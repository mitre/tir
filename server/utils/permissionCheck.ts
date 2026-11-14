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
import { SessionService } from "../auth/sessionService";

export async function userCheck(
  event: any,
  systemId?: string,
  boundaryId?: string | number,
  tierId?: string,
) {
  let userId: number;
  let BoundaryRoleId = null;
  let TierRoleId = null;
  let boundary = null;
  const rawSessionId = getCookie(event, "tirsession");
  const sessionService = new SessionService();
  if (rawSessionId) {
    const session = await sessionService.validateSession(event);

    if (session && session.UserId) {
      userId = session.UserId;
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized Access - Invalid or Expired Session",
      });
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized Access - No Session Found",
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

export async function requireBoundaryEditor(event: any, boundaryId: number) {
  const checkResult = await userCheck(event, undefined, boundaryId);

  const boundary = await Boundary.findByPk(boundaryId);
  if (!boundary) {
    logger.error(`No Boundary found for id: ${boundaryId}.`);
    throw createError({
      statusCode: 404,
      statusMessage: `No Boundary found for id: ${boundaryId}.`,
    });
  }

  const isEditor =
    checkResult.BoundaryRoleId === 1 ||
    checkResult.BoundaryRoleId === 2 ||
    checkResult.UserRoleId === 1;
  if (!isEditor) {
    logger.error(
      `${checkResult.user?.email} must be an Admin, Owner, or Co-Owner of ${boundary.name} to Edit.`,
    );
    throw createError({
      statusCode: 401,
      statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to Edit.",
    });
  }

  return { checkResult, boundary };
}

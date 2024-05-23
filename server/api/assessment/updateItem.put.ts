import { AssessmentItem, Boundary, Boundary_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

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

  const boundary = await Boundary.findByPk(body.BoundaryId, {
    attributes: ["id", "name", "ownerId"],
    include: [
      {
        model: Boundary_User,
      },
    ],
  });
  const isOwner = boundary?.dataValues.ownerId === userId;
  const isMember =
    boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId) !==
    undefined;

  if (isOwner || isMember) {
    if (
      !isOwner &&
      boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)
        .BoundaryRoleId === 3
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to Edit Assessments",
      });
    } else {
      const assessmentItem = await AssessmentItem.findByPk(body.id);

      if (assessmentItem) {
        for (const key in body) {
          assessmentItem.setDataValue(key, body[key]);
        }

        assessmentItem.save();
        return { error: false };
      } else {
        return { error: true, errorMsg: `Assessment Item: ${body.id} not found.` };
      }
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
});

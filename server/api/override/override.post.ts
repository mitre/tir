import { Boundary_User, BoundaryRole, System, UserRole } from "~/db/models";
import { Boundary } from "~/db/models/boundary";
import { AssessmentItem } from "~/db/models/assessmentItem";
import { Assessment } from "~/db/models/assessment";
import { catSeverityToStig } from "~/utils/stig";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const assessmentItemId = body.id;

  const rawToken = getCookie(event, "tirtoken");
  let userId: number;

  userId = 1;

  if (!assessmentItemId) {
    throw createError({
      statusCode: 399,
      statusMessage: `AssessmentItemId required.`,
    });
  }

  const assessmentItem = await AssessmentItem.findOne({
    include: {
      model: Assessment,
      include: [
        {
          model: System,
          include: [
            {
              model: Boundary,
              include: [
                {
                  model: Boundary_User,
                  include: [{ model: BoundaryRole }],
                },
              ],
            },
          ],
        },
      ],
    },
    where: {
      id: assessmentItemId,
    },
  });
  if (!assessmentItem) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unable to find AssessmentItem`,
    });
  }
  const boundaryUser = assessmentItem?.System?.Boundary?.Boundary_User?.find(
    (boundaryUser) => boundaryUser.id === userId,
  );

  if (boundaryUser) {
    console.log("foundUser");
  }

  const updateObject = {
    statusOverride: body.statusOverride,
    statusOverrideJustification: body.statusOverrideJustification,
    severityOverride: catSeverityToStig(body.severityOverride) || body.severityOverride,
    severityOverrideJustification: body.severityOverrideJustification,
  };

  await assessmentItem.update(updateObject);

  return { success: true };
});

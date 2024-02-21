import { AssessmentItem } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

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
});

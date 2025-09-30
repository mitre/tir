import { CciItem, CciReference } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  await userCheck(event, undefined, undefined, undefined);
  const references = await CciItem.findAll({
    include: [
      {
        model: CciReference,
      },
    ],
    where: {
      cciId: query.cci,
    },
  });

  return references;
});

import { CciItem, CciReference } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

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

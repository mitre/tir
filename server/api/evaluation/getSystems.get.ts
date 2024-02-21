import {
  System,
  AssessmentItem,
  Assessment,
  Boundary,
  StigData,
  Override,
} from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const allFindingsOrdered = await StigData.findOne({
    attributes: ["id"],
    where: { id: query.params1 },
    include: [
      {
        model: AssessmentItem,
        attributes: ["status", "id"],
        required: true,
        include: [
          {
            model: Assessment,
            attributes: ["StigId", "SystemId"],
            required: true,
            include: [
              {
                model: System,
                attributes: ["name"],
                required: true,
                include: [
                  {
                    model: Boundary,
                    attributes: [],
                    required: true,
                    where: {
                      id: query.params2,
                    },
                  },
                  {
                    model: Override,
                    where: {
                      StigDatumId: query.params1,
                    },
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],

    order: ["id"],
  });

  return allFindingsOrdered;
});

import { Override } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  await userCheck(event, query.params1?.toString(), undefined, undefined);
  const overrides = await Override.findAll({
    where: {
      SystemId: query.params1,
      StigDatumId: query.params2,
    },
  });

  return overrides;
});

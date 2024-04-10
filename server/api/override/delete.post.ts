import { Override } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const override = await Override.destroy({
    where: {
      SystemId: body.SystemId,
      StigDatumId: body.StigDatumId,
    },
  });

  return override;
});

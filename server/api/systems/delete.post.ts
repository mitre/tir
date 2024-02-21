import { System } from "../../../db/models/system";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const system = await System.destroy({
    where: {
      id: body.SystemId,
    },
  });

  return system;
});

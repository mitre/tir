import { Assessment, Stig, System, SystemInterface } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const stig = await Stig.findByPk(body.StigId);
  const system = (await System.findByPk(body.SystemId)) as SystemInterface;

  if (!stig || !system) {
    if (!stig) {
      return {
        success: false,
        error: "Unable to find StigId",
        id: body.StigId,
      };
    } else {
      return {
        success: false,
        error: "Unable to find SystemId",
        id: body.SystemId,
      };
    }
  }
  await system.removeStig(stig);

  const numDestroyed = await Assessment.destroy({
    where: {
      SystemId: body.SystemId,
      StigId: body.StigId,
    },
  });

  console.log("Destroyed: ", numDestroyed);

  return { success: true };
});

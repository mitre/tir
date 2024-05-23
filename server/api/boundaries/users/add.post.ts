import { User, Boundary, BoundaryInterface } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await User.findByPk(body.UserId);
  const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;

  if (!user || !boundary) {
    if (!user) {
      logger.error(`Unable to find UserId`);
      return {
        success: false,
        error: "Unable to find UserId",
        id: body.UserId,
      };
    } else {
      logger.error(`Unable to find BoundaryId`);
      return {
        success: false,
        error: "Unable to find BoundaryId",
        id: body.BoundaryId,
      };
    }
  }
  await boundary.addUser(user, { through: { BoundaryRoleId: body.BoundaryRoleId } });
  logger.info({
    service: "Boundary",
    message: `${user?.email} Successfully Added to: ${boundary.name}`,
  });
  return { success: true };
});

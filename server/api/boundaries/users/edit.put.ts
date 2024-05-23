import {
  Boundary,
  BoundaryRole,
  Boundary_User,
  User,
  BoundaryInterface,
} from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await User.findByPk(body.UserId);
  const role = await BoundaryRole.findByPk(body.BoundaryRoleId);
  const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;

  const boundary_user = await Boundary_User.findOne({
    where: { BoundaryId: body.BoundaryId, UserId: body.UserId },
  });
  boundary_user?.setDataValue("BoundaryRoleId", body.BoundaryRoleId);
  boundary_user?.save();
  logger.info({
    service: "Boundary",
    message: `${boundary?.name}: user ${user?.email} role updated to: ${role?.name}`,
  });
  return boundary_user;
});

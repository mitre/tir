import { Boundary_User } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const boundary_user = await Boundary_User.findOne({
    where: { BoundaryId: body.BoundaryId, UserId: body.UserId },
  });
  boundary_user?.setDataValue("BoundaryRoleId", body.BoundaryRoleId);
  boundary_user?.save();
  return boundary_user;
});

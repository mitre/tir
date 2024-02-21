import { BoundaryRole } from "../../../../db/models";

export default defineEventHandler(async () => {
  const boundaryRole = await BoundaryRole.findAll();

  return boundaryRole;
});

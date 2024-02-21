import { TierRole } from "../../../../db/models";

export default defineEventHandler(async () => {
  const tierRole = await TierRole.findAll();

  return tierRole;
});

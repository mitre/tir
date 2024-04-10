import { PolicyDocument } from "../../../db/models";

export default defineEventHandler(async () => {
  const titles = await PolicyDocument.findAll();
  return titles;
});

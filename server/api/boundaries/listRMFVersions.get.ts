import { PolicyDocument } from "../../../db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const titles = await PolicyDocument.findAll();
  return titles;
});

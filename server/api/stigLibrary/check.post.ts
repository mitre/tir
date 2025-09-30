import { parseLibraryName } from "../../utils/stigLibrary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await userCheck(event, undefined, undefined, undefined);
  console.log(body.filename);
  const results = parseLibraryName(body.filename);
  console.log(results);
  return results;
});

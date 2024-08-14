import { parseLibraryName } from "../../utils/stigLibrary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body.filename);
  const results = parseLibraryName(body.filename);
  console.log(results);
  return results;
});

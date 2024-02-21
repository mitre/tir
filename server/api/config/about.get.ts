import { version, build } from "../../../package.json";

export default defineEventHandler(async (event) => {
  return {
    version,
    date: build,
  };
});

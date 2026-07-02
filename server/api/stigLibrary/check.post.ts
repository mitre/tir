export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);
  const body = await readBody(event);
  const filename = typeof body?.filename === "string" ? body.filename : "";
  const isZip = filename.toLowerCase().endsWith(".zip");

  return {
    error: !isZip,
    message: isZip ? "" : "File must be a .zip STIG Library compilation.",
  };
});

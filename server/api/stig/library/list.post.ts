import { Stig, StigLibrary, StigLibraryWithStigs } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await userCheck(event, undefined, undefined, undefined);
  const stigLibraryId = body.StigLibraryId;

  const stigLibrary = (await StigLibrary.findOne({
    where: { id: stigLibraryId },
    include: [
      {
        model: Stig,
        attributes: ["id", "title"],
      },
    ],
  })) as StigLibraryWithStigs;

  return stigLibrary.Stigs;
});

import { DateTime } from "luxon";
import { recomputeRevisionLabels } from "~/server/utils/libraryRevisions";
import { StigLibrary } from "~/db/models";

const MAX_LABEL_LENGTH = 64;

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId !== 1) {
    throw createError({ statusCode: 403, statusMessage: "Administrator role required." });
  }

  const id = Number(event.context.params?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid library id." });
  }

  const library = await StigLibrary.findByPk(id);
  if (!library) {
    throw createError({ statusCode: 404, statusMessage: `No STIG library with id ${id}.` });
  }

  const body = await readBody(event);
  const raw = body?.label;
  if (raw !== null && raw !== undefined && typeof raw !== "string") {
    throw createError({ statusCode: 400, statusMessage: "label must be a string or null." });
  }
  const label = typeof raw === "string" ? raw.trim() : "";

  if (label.length > MAX_LABEL_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `label must be at most ${MAX_LABEL_LENGTH} characters.`,
    });
  }

  if (label) {
    library.revisionLabel = label;
    library.labelSource = "admin";
    library.lastUpdate = DateTime.now().toISO();
    await library.save();
  } else {
    library.labelSource = "auto";
    library.revisionLabel = null;
    library.lastUpdate = DateTime.now().toISO();
    await library.save();
    await recomputeRevisionLabels(library.classification, library.libraryDate);
    await library.reload();
  }

  return {
    id: library.id,
    revisionLabel: library.revisionLabel,
    labelSource: library.labelSource,
  };
});

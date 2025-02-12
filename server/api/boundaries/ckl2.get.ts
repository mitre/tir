import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { Readable } from "node:stream";
import { sendStream } from "h3";
import { parseStringPromise } from "xml2js";
import { buildCklString, getSI_DataByName } from "../../utils/checklist";
import { Boundary, Boundary_User, System, User } from "~/db/models";
import { zipDirectoryContents } from "~/server/utils/zip";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!query.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: `BoundaryId required.`,
    });
  }
  const checkResult = await userCheck(event, undefined, query.BoundaryId?.toString(), undefined);

  let singleStigPerCkl = false;

  if (query.SingleStigPerCkl === "true") {
    singleStigPerCkl = true;
  }

  const BoundaryId = parseInt(query.BoundaryId?.toString(), 10);

  if (isNaN(BoundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  const boundary = await Boundary.findOne({
    include: [
      {
        model: Boundary_User,
      },
      {
        model: System,
      },
    ],
    where: {
      id: BoundaryId,
    },
  });

  if (!boundary) {
    throw createError({
      statusCode: 404,
      statusMessage: `Boundary not Found. BoundaryId: ${query.BoundaryId}`,
    });
  }

  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Permission Not Granted. Not a member of this Enclave",
    });
  }

  const config = useRuntimeConfig();
  const randomDirName = crypto.randomBytes(16).toString("hex");
  const dirPath = path.join(config.temp_folder, randomDirName);

  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.error(`Unabled to create dir in ${config.temp_folder}`);
    throw createError({
      statusCode: 503,
      statusMessage: "Unable to create Checklist.",
    });
  }

  for (const system of boundary.Systems ?? []) {
    const systemPath = path.join(dirPath, system.name);

    try {
      await fs.mkdir(systemPath, { recursive: true });
    } catch (error) {
      logger.error(`Unabled to create dir in ${dirPath}`);
      throw createError({
        statusCode: 503,
        statusMessage: "Unable to create Checklist.",
      });
    }

    if (singleStigPerCkl) {
      const cklStrings = await buildCklString(system.id, true);

      for (const cklString of cklStrings) {
        const jsonCkl = await parseStringPromise(cklString, { explicitArray: false });
        let stigArrayFromCkl = jsonCkl.CHECKLIST.STIGS.iSTIG;

        if (!Array.isArray(stigArrayFromCkl)) {
          stigArrayFromCkl = [stigArrayFromCkl];
        }

        const cklStigId = getSI_DataByName(stigArrayFromCkl[0].STIG_INFO.SI_DATA, "stigid");
        await fs.writeFile(`${systemPath}/${cklStigId}.ckl`, cklString);
      }
    } else {
      const cklString = await buildCklString(system.id, false);
      await fs.writeFile(`${systemPath}/${system.name}.ckl`, cklString);
    }
  }

  const zipFileName = `${config.temp_folder}/${boundary.name}.zip`;
  zipDirectoryContents(dirPath, zipFileName);

  const data: Buffer = await fs.readFile(zipFileName);
  const stream = new Readable();
  stream.push(data);
  stream.push(null);

  setResponseHeader(event, "Content-Disposition", `attachment; filename="${boundary.name}.zip"`);
  setResponseHeader(event, "Content-Type", "application/octet-stream");

  return sendStream(event, stream);
});

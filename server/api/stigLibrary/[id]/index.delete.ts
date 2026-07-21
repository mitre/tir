/* eslint-disable camelcase */
import * as fs from "fs";
import * as path from "path";
import { Op, type Transaction } from "sequelize";
import { recomputeRevisionLabels } from "~/server/utils/libraryRevisions";
import { beginLibraryDeletion, endLibraryDeletion } from "~/server/utils/importLock";
import {
  Assessment,
  Boundary,
  Evaluation,
  ImportJob,
  Stig,
  StigData,
  StigLibrary,
  StigLibrary_Stig,
  Stig_StigData,
  Stig_System,
  StigData_StigIdent,
  StigData_StigReference,
  StigData_StigResponsibility,
  AssessmentItem,
  EvaluationItem,
} from "~/db/models";

const CHUNK = 5000;

function chunks<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += CHUNK) out.push(items.slice(i, i + CHUNK));
  return out;
}

async function stigIdsExclusiveTo(libraryId: number, memberIds: number[]): Promise<number[]> {
  const alsoInOtherLibraries = new Set<number>();
  for (const batch of chunks(memberIds)) {
    const rows = await StigLibrary_Stig.findAll({
      attributes: ["StigId"],
      where: { StigId: { [Op.in]: batch }, StigLibraryId: { [Op.ne]: libraryId } },
      raw: true,
    });
    for (const row of rows) alsoInOtherLibraries.add(row.StigId);
  }
  return memberIds.filter((stigId) => !alsoInOtherLibraries.has(stigId));
}

async function orphanedStigDataIds(
  candidateIds: number[],
  transaction: Transaction,
): Promise<number[]> {
  const orphanIds: number[] = [];
  for (const batch of chunks(candidateIds)) {
    const where = { StigDatumId: { [Op.in]: batch } };
    const stillReferenced = new Set([
      ...(await Stig_StigData.findAll({ where, attributes: ["StigDatumId"], raw: true, transaction })).map(
        (row) => row.StigDatumId,
      ),
      ...(await AssessmentItem.findAll({ where, attributes: ["StigDatumId"], raw: true, transaction })).map(
        (row) => row.StigDatumId,
      ),
      ...(await EvaluationItem.findAll({ where, attributes: ["StigDatumId"], raw: true, transaction })).map(
        (row) => row.StigDatumId,
      ),
    ]);
    orphanIds.push(...batch.filter((dataId) => !stillReferenced.has(dataId)));
  }
  return orphanIds;
}

async function deleteStigsAndOrphanedData(
  exclusiveIds: number[],
  transaction: Transaction,
): Promise<{ stigs: number; stigData: number }> {
  const candidateIds = new Set<number>();
  for (const batch of chunks(exclusiveIds)) {
    const rows = await Stig_StigData.findAll({
      attributes: ["StigDatumId"],
      where: { StigId: { [Op.in]: batch } },
      raw: true,
      transaction,
    });
    for (const row of rows) candidateIds.add(row.StigDatumId);
    await Stig_System.destroy({ where: { StigId: { [Op.in]: batch } }, transaction });
    await Stig_StigData.destroy({ where: { StigId: { [Op.in]: batch } }, transaction });
  }

  const orphanIds = await orphanedStigDataIds([...candidateIds], transaction);
  for (const batch of chunks(orphanIds)) {
    const where = { StigDatumId: { [Op.in]: batch } };
    await StigData_StigResponsibility.destroy({ where, transaction });
    await StigData_StigReference.destroy({ where, transaction });
    await StigData_StigIdent.destroy({ where, transaction });
    await StigData.destroy({ where: { id: { [Op.in]: batch } }, transaction });
  }

  for (const batch of chunks(exclusiveIds)) {
    await Stig.destroy({ where: { id: { [Op.in]: batch } }, transaction });
  }

  return { stigs: exclusiveIds.length, stigData: orphanIds.length };
}

async function deleteImportWorkingFiles(libraryId: number): Promise<void> {
  const config = useRuntimeConfig();
  const jobs = await ImportJob.findAll({ where: { stigLibraryId: libraryId } });
  for (const job of jobs) {
    fs.rmSync(path.join(config.temp_folder, `${job.uid}-work`), { recursive: true, force: true });
    fs.rmSync(path.join(config.temp_folder, job.uid), { recursive: true, force: true });
    fs.rmSync(path.join(config.temp_folder, `${job.uid}.json`), { force: true });
  }
}

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

  const blockedBy = await beginLibraryDeletion(`deletion of library ${id} (${library.filename})`);
  if (blockedBy) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot delete the library: ${blockedBy}. Wait for it to finish.`,
    });
  }

  let removed = { stigs: 0, stigData: 0 };
  let memberIds: number[] = [];
  try {
    const boundaryCount = await Boundary.count({ where: { StigLibraryId: id } });
    if (boundaryCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `${boundaryCount} boundar${boundaryCount === 1 ? "y" : "ies"} still use this library. Migrate them to another library first.`,
      });
    }

    const memberRows = await StigLibrary_Stig.findAll({
      attributes: ["StigId"],
      where: { StigLibraryId: id },
      raw: true,
    });
    memberIds = memberRows.map((row) => row.StigId);
    const exclusiveIds = memberIds.length > 0 ? await stigIdsExclusiveTo(id, memberIds) : [];

    if (exclusiveIds.length > 0) {
      const assessmentCount = await Assessment.count({
        where: { StigId: { [Op.in]: exclusiveIds } },
      });
      if (assessmentCount > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: `${assessmentCount} assessment(s) reference STIGs that exist only in this library. Migrate or delete them first.`,
        });
      }
      const evaluationCount = await Evaluation.count({
        where: { StigId: { [Op.in]: exclusiveIds } },
      });
      if (evaluationCount > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: `${evaluationCount} evaluation(s) reference STIGs that exist only in this library. Remove them first.`,
        });
      }
    }

    const transaction = await sequelize.transaction();
    try {
      if (exclusiveIds.length > 0) {
        removed = await deleteStigsAndOrphanedData(exclusiveIds, transaction);
      }
      await StigLibrary_Stig.destroy({ where: { StigLibraryId: id }, transaction });
      await library.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logSequelizeError(error);
      throw createError({ statusCode: 500, statusMessage: "Failed to delete the STIG library." });
    }

    await recomputeRevisionLabels(library.classification, library.libraryDate);

    try {
      await deleteImportWorkingFiles(id);
    } catch (error) {
      logger.warning({
        service: "Library",
        message: `Library ${id} deleted, but its working files could not be removed: ${error}`,
      });
    }
  } finally {
    endLibraryDeletion();
  }

  const deletedBy = checkResult.user;
  const userLabel = deletedBy
    ? `${deletedBy.firstName} ${deletedBy.lastName} <${deletedBy.email}> (id ${deletedBy.id})`
    : "unknown user";

  logger.info({
    service: "Library",
    event: "library.deleted",
    message: `STIG Library ${id} (${library.classification} ${library.libraryDate}, ${library.filename}) deleted by ${userLabel}: ${removed.stigs} exclusive STIG(s), ${removed.stigData} orphaned rule(s) removed.`,
    userId: deletedBy?.id ?? null,
    userEmail: deletedBy?.email ?? null,
    libraryId: id,
  });

  return {
    deleted: id,
    detachedStigs: memberIds.length - removed.stigs,
    removedStigs: removed.stigs,
    removedStigData: removed.stigData,
  };
});

import { DateTime } from "luxon";
import { Stig, StigLibrary } from "../../db/models";
import {
  diffBenchmarks,
  sortOldestFirst,
  groupLabels,
  type BenchmarkTuple,
  type GroupMember,
  type LibraryDiff,
} from "./revisionMath";

export type RevisionSummary = {
  label: string | null;
  groupSize: number;
  diff: (LibraryDiff & { againstLibraryId: number }) | null;
};

function toBenchmarkTuples(stigs: Stig[]): BenchmarkTuple[] {
  return stigs.map((stig) => ({
    stigid: stig.stigid,
    version: Number(stig.version) || 0,
    release: Number(stig.stigRelease) || 0,
    date: stig.status__date ?? "",
  }));
}

async function loadSameDateGroup(
  classification: string,
  libraryDate: string,
): Promise<GroupMember<StigLibrary>[]> {
  const libraries = await StigLibrary.findAll({
    where: { classification, libraryDate },
    include: [
      {
        model: Stig,
        attributes: ["stigid", "version", "stigRelease", "status__date"],
        through: { attributes: [] },
      },
    ],
  });
  return libraries.map((library) => ({
    ref: library,
    benchmarks: toBenchmarkTuples(library.Stigs ?? []),
    id: library.id,
  }));
}

export async function recomputeRevisionLabels(
  classification: string | null,
  libraryDate: string | null,
): Promise<RevisionSummary | null> {
  if (!classification || !libraryDate) return null;

  const ordered = sortOldestFirst(await loadSameDateGroup(classification, libraryDate));
  if (ordered.length === 0) return null;

  const labels = groupLabels(ordered.length);
  for (let i = 0; i < ordered.length; i++) {
    const library = ordered[i].ref;
    if (library.labelSource !== "auto") continue;
    if (library.revisionLabel === labels[i]) continue;
    library.revisionLabel = labels[i];
    library.lastUpdate = DateTime.now().toISO();
    await library.save();
  }

  const newest = ordered[ordered.length - 1];
  const previous = ordered.length > 1 ? ordered[ordered.length - 2] : null;
  return {
    label: newest.ref.revisionLabel,
    groupSize: ordered.length,
    diff: previous
      ? {
          againstLibraryId: previous.id,
          ...diffBenchmarks(newest.benchmarks, previous.benchmarks),
        }
      : null,
  };
}

export async function recomputeAndSummarize(
  library: StigLibrary,
): Promise<RevisionSummary | null> {
  const recomputed = await recomputeRevisionLabels(library.classification, library.libraryDate);
  if (!recomputed) return null;

  const ordered = sortOldestFirst(
    await loadSameDateGroup(library.classification, library.libraryDate),
  );
  const index = ordered.findIndex((member) => member.id === library.id);
  if (index === -1) return recomputed;

  const previous = index > 0 ? ordered[index - 1] : null;
  return {
    label: ordered[index].ref.revisionLabel,
    groupSize: ordered.length,
    diff: previous
      ? {
          againstLibraryId: previous.id,
          ...diffBenchmarks(ordered[index].benchmarks, previous.benchmarks),
        }
      : null,
  };
}

export type BenchmarkTuple = {
  stigid: string;
  version: number;
  release: number;
  date: string;
};

export type GroupMember<T = unknown> = {
  ref: T;
  benchmarks: BenchmarkTuple[];
  id: number;
};

export type LibraryDiff = {
  added: string[];
  removed: string[];
  changed: { stigid: string; from: string; to: string }[];
};

function tupleKey(b: BenchmarkTuple): string {
  return `v${b.version}r${b.release} ${b.date}`;
}

function compareBenchmarks(a: BenchmarkTuple, b: BenchmarkTuple): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.version !== b.version) return a.version - b.version;
  return a.release - b.release;
}

export function compareByDominance(a: BenchmarkTuple[], b: BenchmarkTuple[]): number {
  const bByStigid = new Map(b.map((t) => [t.stigid, t]));
  let aNewer = 0;
  let bNewer = 0;
  for (const tupleA of a) {
    const tupleB = bByStigid.get(tupleA.stigid);
    if (!tupleB) continue;
    const cmp = compareBenchmarks(tupleA, tupleB);
    if (cmp > 0) aNewer++;
    else if (cmp < 0) bNewer++;
  }
  if (aNewer > 0 && bNewer === 0) return 1;
  if (bNewer > 0 && aNewer === 0) return -1;
  return 0;
}

export function averageBenchmarkTime(benchmarks: BenchmarkTuple[]): number {
  const times = benchmarks.map((b) => Date.parse(b.date)).filter(Number.isFinite);
  if (times.length === 0) return 0;
  return times.reduce((sum, time) => sum + time, 0) / times.length;
}

export function sortOldestFirst<T>(members: GroupMember<T>[]): GroupMember<T>[] {
  return [...members].sort((a, b) => {
    const dominance = compareByDominance(a.benchmarks, b.benchmarks);
    if (dominance !== 0) return dominance;
    const averageGap = averageBenchmarkTime(a.benchmarks) - averageBenchmarkTime(b.benchmarks);
    if (averageGap !== 0) return averageGap;
    return a.id - b.id;
  });
}

export function groupLabels(size: number): string[] {
  return Array.from({ length: size }, (_, i) => `rev ${i + 1}`);
}

export function diffBenchmarks(newer: BenchmarkTuple[], older: BenchmarkTuple[]): LibraryDiff {
  const newById = new Map(newer.map((t) => [t.stigid, t]));
  const oldById = new Map(older.map((t) => [t.stigid, t]));

  const added: string[] = [];
  const changed: LibraryDiff["changed"] = [];
  for (const [stigid, tuple] of newById) {
    const old = oldById.get(stigid);
    if (!old) added.push(stigid);
    else if (compareBenchmarks(tuple, old) !== 0) {
      changed.push({ stigid, from: tupleKey(old), to: tupleKey(tuple) });
    }
  }
  const removed = [...oldById.keys()].filter((stigid) => !newById.has(stigid));

  added.sort();
  removed.sort();
  changed.sort((a, b) => a.stigid.localeCompare(b.stigid));
  return { added, removed, changed };
}

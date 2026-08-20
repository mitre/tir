import { CciItem, CciReference } from "~/db/models";

export function normalizeCciControlIndex(index: string): string | null {
  const controlMatch = index
    .trim()
    .toUpperCase()
    .match(/^([A-Z]{2}-\s*\d+(?:\s*\(\d+\))?)/);

  return controlMatch
    ? controlMatch[1].replace(/\s+/g, "")
    : null;
}

export async function getCciMappingData(
  policyDocumentId: number | undefined,
) {
  const cciItems = await CciItem.findAll({
    attributes: ["cciId", "definition"],
    include: [
      {
        model: CciReference,
        attributes: ["index"],
        through: { attributes: [] },
        where: {
          PolicyDocumentId: policyDocumentId,
        },
      },
    ],
  });

  const cciMap = new Map<string, string[]>();

  for (const cciItem of cciItems) {
    const refs = cciItem.CciReferences ?? [];

    for (const ref of refs) {
      if (!ref.index) continue;

      const normalizedIndex =
        normalizeCciControlIndex(ref.index);

      if (!normalizedIndex) continue;

      const cciIds = cciMap.get(normalizedIndex) ?? [];

      if (!cciIds.includes(cciItem.cciId)) {
        cciIds.push(cciItem.cciId);
      }

      cciMap.set(normalizedIndex, cciIds);
    }
  }

  return {
    cciItems,
    cciMap,
  };
}
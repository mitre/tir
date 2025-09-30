import { TirAlias } from "~/db/models/tirAlias";

export async function getAliasData(): Promise<{ term: string; alias: string }[]> {
  const tirAliases = await TirAlias.findAll();
  return tirAliases.map((alias) => {
    const plainAlias = alias.toJSON();
    return { term: plainAlias.term, alias: plainAlias.alias };
  });
}

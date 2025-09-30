import { defineStore } from "pinia";
import { clientLogger } from "~/utils/clientLogger";

export interface AliasEntry {
  term: string;
  alias: string;
}

export const useAliasStore = defineStore("alias", {
  state: () => ({
    aliases: [] as AliasEntry[],
    CompanyAlias: "Company",
    BoundaryAlias: "Boundary",
    SystemAlias: "System",
  }),
  actions: {
    async loadAliases() {
      let aliasData: AliasEntry[] = [];
      if (import.meta.server) {
        logger.debug({ service: "stores", message: "[AliasStore] Running on server" });
        try {
          const { getAliasData } = await import("~/server/utils/alias");
          aliasData = await getAliasData();
          logger.debug({
            service: "stores",
            message: `[AliasStore] Received aliasData from server: ${aliasData}`,
          });
        } catch (err) {
          logger.error({
            service: "stores",
            message: `[AliasStore] Error loading aliases on server: ${err}`,
          });
          aliasData = [];
        }
      } else {
        clientLogger.log("[AliasStore] Running on client fallback");
        try {
          aliasData = await $fetch("/api/config/alias");
          clientLogger.log("[AliasStore] Received aliasData from client fallback:", aliasData);
        } catch (err) {
          clientLogger.error("[AliasStore] Error fetching aliases on client:", err);
          aliasData = [];
        }
      }

      this.aliases = aliasData || [];
      const aliasMap = aliasData.reduce(
        (map: Record<string, string>, entry: AliasEntry) => {
          map[entry.term] = entry.alias;
          return map;
        },
        {} as Record<string, string>,
      );
      this.CompanyAlias = aliasMap.Company || "Company";
      this.BoundaryAlias = aliasMap.Boundary || "Boundary";
      this.SystemAlias = aliasMap.System || "System";
    },
  },
});

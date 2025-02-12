import { defineStore } from "pinia";

export const useAliasStore = defineStore("AliasStorage", {
  state: () => ({
    CompanyAlias: "Company",
    BoundaryAlias: "Boundary",
    SystemAlias: "System",
  }),

  persist: {},
});

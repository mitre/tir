import { defineStore } from "pinia";

export const useIdStorageStore = defineStore("IdStorage", {
  state: () => ({
    BoundaryId: null,
    StigLibraryId: null,
    SystemId: null,
    StigId: null,
    BoundaryName: "",
    assessmentId: 0,
    selectedFilterStore: [],
    Summary: null,
  }),
  actions: {
    addBoundaryId(BoundaryId) {
      this.BoundaryId.push({ BoundaryId });
    },
    deleteUserList(itemUser) {
      this.UserList = this.UserList.filter((object) => {
        return object.id !== itemUser;
      });
    },
  },
  persist: {},
});

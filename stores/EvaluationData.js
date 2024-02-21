import { defineStore } from 'pinia'

export const useEvaluationDataStore = defineStore("EvaluationData", {
    state: () => ({
        BoundaryName: null,
        StigName: null,
        Version: null,
        StigDate: null


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
    persist:{
    },
  })
import { defineStore } from 'pinia'

export const useTempStigListStore = defineStore("TempStigList", {
    state: () => ({
        TempStigList: [],
    }),
    actions: {
      addTempStigList(StigId, SystemId, name) {
        this.TempStigList.push( {StigId, SystemId, name} );
        },
      deleteTempStigList(Id) {
        this.TempStigList = this.TempStigList.filter((object) => {
          return object.StigId !== Id;
        });
      },
    },

  })
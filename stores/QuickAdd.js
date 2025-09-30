import { defineStore } from 'pinia'

export const useQuickAddStore = defineStore("QuickAdd", {
    state: () => ({
        SystemStigData: [],
        id:0

    }),
    actions: {
      addSystem() {
        this.SystemStigData.push({ id: this.id++, Name: null, TempStigList: [] });
        },
      addSystemCopy(name,tempStigCopy) {
        this.SystemStigData.push({ id: this.id++, Name: name + '(Copy)', TempStigList: [] });
        // console.log('Temp List',tempStigCopy);
        // this.SystemStigData[id].TempStigList.push( tempStigCopy );
        },
      deleteSystem(id) {
        this.SystemStigData = this.SystemStigData.filter((object) => {
          return object.id !== id;
        });
      },
      addTempStigList( sysId, StigId, name) {
        this.SystemStigData[sysId].TempStigList.push( {StigId, name} );
        },
      deleteTempStigList(stigId,index) {
        this.SystemStigData[index].TempStigList = this.SystemStigData[index].TempStigList.filter((object) => {
          return object.StigId !== stigId;
        });
      },
    },
    persist:{
    },
  })
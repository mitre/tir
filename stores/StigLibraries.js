import { defineStore } from 'pinia'

export const useStigLibrariesStore = defineStore("StigLibraries", {
    state: () => ({
        StigLibraries: [],
        ControlOverlays: [],
        Stigid:0,
        Overlayid:0
    }),
    actions: {
      addStigLibrary(libraryName,dateAdded) {
        this.StigLibraries.push({ libraryName,dateAdded, Stigid: this.Stigid++ });
        },
      deleteStigLibrary(itemId) {
        this.StigLibraries = this.StigLibraries.filter((object) => {
          return object.Stigid !== itemId;
        });
      },


      addControlOverlay(overlayName,dateAdded) {
        this.ControlOverlays.push({ overlayName,dateAdded, Overlayid: this.Overlayid++ });
        },
      deleteControlOverlay(itemId) {
        this.ControlOverlays = this.ControlOverlays.filter((object) => {
          return object.Overlayid !== itemId;
        });
      }
    },
    persist:{
    },
  })
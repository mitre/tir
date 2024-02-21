import { defineStore } from 'pinia'

export const useBreadcrumbStore = defineStore("Breadcrumb", {
    state: () => ({
        pages: [],
        tierId : null
    }),
    actions: {

      addBreadcrumb(pageInfo) {
        this.pages.push(pageInfo);
        },
      deleteBreadcrumb(parentId) {
        this.pages = this.pages.filter((object) => {
          return object.parentId !== parentId;
        });
      },
    },
    persist:{
    },
  })
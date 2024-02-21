import { defineStore } from 'pinia'

export const useUserListStore = defineStore("UserList", {
    state: () => ({
        UserList: [],
        id:0
    }),
    actions: {
      addUserList(userName,date) {
        this.UserList.push({ userName, date,id: this.id++ });
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
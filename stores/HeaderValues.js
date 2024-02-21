import {defineStore} from 'pinia'

export const useTestStore = defineStore('test', {
    state: () => {
        return{
            username: null,
            HomeCurrent: null,
            BoundCurrent: null,
            LibCurrent: null
        }
    }, 
    actions:{
        changeUsername (payload) {
            this.username = payload
        },
        changeHomeCurrent(p1){
            this.HomeCurrent = p1
        },
        changeBoundCurrent(p2){
            this.BoundCurrent = p2
        },
        changeLibCurrent(p3){
            this.LibCurrent = p3
        }

    },
    persist:true,
})
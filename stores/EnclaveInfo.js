import { defineStore } from 'pinia'
import { useTempStigListStore as actionStore } from '~/stores/TempStigList'

export const useEnclaveInfoStore = defineStore("EnclaveInfo", {
    state: () => ({
        CompanyInfo: [],
        // EnclaveInfo: [],        
        id:0
    }),
    actions: {

      addCompanyInfo(companyName, dateCreated) {
        this.CompanyInfo.push({ companyName, dateCreated, EnclaveInfo: [], id: this.id++ });
        },
      deleteCompany(itemId) {
        this.CompanyInfo = this.CompanyInfo.filter((object) => {
          return object.id !== itemId;
        });
      },

      addEnclaveInfo(num,enclaveName,ownerName,dateCreated,SystemInfo) {
        // this.EnclaveInfo.push({ enclaveName,ownerName, dateCreated, id: this.id++,SystemInfo: [], });
        this.CompanyInfo[num].EnclaveInfo.push({ enclaveName,ownerName, dateCreated, id: this.id++,SystemInfo: [], })
        },
      deleteEnclave(itemId, num) {
        this.CompanyInfo[num].EnclaveInfo = this.CompanyInfo[num].EnclaveInfo.filter((object) => {
          return object.id !== itemId;
        });
      },

      addSystemInfo(systemName,companyNum, boundNum) {
        this.CompanyInfo[companyNum].EnclaveInfo[boundNum].SystemInfo.push({ systemName, StigList: actionStore().TempStigList });
        },
      deleteSystemInfo(itemId,companyNum,num) {
        this.CompanyInfo[companyNum].EnclaveInfo[num].SystemInfo = this.CompanyInfo[companyNum].EnclaveInfo[num].SystemInfo.filter((object) => {
          return object.systemName !== itemId;
        });
      },

      addStigItem(stigName,companyNum, num2,num) {
        this.CompanyInfo[companyNum].EnclaveInfo[num2].SystemInfo[num].StigList.push({ stigName });
        },
      
      deleteStigItem(itemId,companyNum,num2,num) {
        this.CompanyInfo[companyNum].EnclaveInfo[num2].SystemInfo[num].StigList = this.CompanyInfo[companyNum].EnclaveInfo[num2].SystemInfo[num].StigList.filter((object) => {
          return object.stigName !== itemId;
        });
      },

    },
    persist:{
    },
  })
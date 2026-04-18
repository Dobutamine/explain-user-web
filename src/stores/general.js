import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state: () => ({
    //apiUrl: "http://localhost:8081",
    version: "1.0",
    apiUrl: "https://explain-user.com",
    loadFromDisk: JSON.parse(localStorage.getItem("loadFromDisk") || "false"),
    diskModelDefinition: localStorage.getItem("diskModelDefinition") || "term_neonate_clean",
  }),

  getters: {},

  actions: {
    setLoadFromDisk(val) {
      this.loadFromDisk = val;
      localStorage.setItem("loadFromDisk", JSON.stringify(val));
    },
    setDiskModelDefinition(val) {
      this.diskModelDefinition = val;
      localStorage.setItem("diskModelDefinition", val);
    },
  },

});

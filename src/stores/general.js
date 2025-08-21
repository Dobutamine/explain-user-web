import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state: () => ({
    //apiUrl: "http://localhost:9000",
    apiUrl: "https://explain-user.com",
  }),

  getters: {},

  actions: {},

});

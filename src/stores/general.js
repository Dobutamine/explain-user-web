import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state: () => ({
    //apiUrl: "http://localhost:8081",
    apiUrl: "https://explain-user.com",
  }),

  getters: {},

  actions: {},

});

import { defineStore } from "pinia";
import { explain } from "src/boot/explain";

export const useModelStore = defineStore("model", {
  state: () => ({
    isReady: false,
    isRunning: false,
    statusMessage: "",
    modelState: {},
    error: null,
    modelInterface: null,
    modelTypeInterface: null,
    modelTypes: null,
    modelProps: null,
    propValue: null,
  }),

  actions: {
    init() {
      explain.on("model_ready", (payload) => {
        this.isReady = true;
        this.modelState = payload;
      });

      explain.on("rt_start", () => {
        this.isRunning = true;
      });

      explain.on("rt_stop", () => {
        this.isRunning = false;
      });

      explain.on("state", () => {
        this.modelState = explain.modelState;
      });

      explain.on("status", () => {
        this.statusMessage = explain.statusMessage;
      });

      explain.on("state_saved", () => {
        // savedState is accessed directly via explain.savedState
      });

      explain.on("model_interface", (payload) => {
        this.modelInterface = payload;
      });

      explain.on("modeltype_interface", (payload) => {
        this.modelTypeInterface = payload;
      });

      explain.on("model_types", (payload) => {
        this.modelTypes = payload;
      });

      explain.on("model_props", (payload) => {
        this.modelProps = payload;
      });

      explain.on("prop_value", (payload) => {
        this.propValue = payload;
      });
    },
  },
});

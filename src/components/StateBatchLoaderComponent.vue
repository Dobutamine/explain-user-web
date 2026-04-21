<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>

    <div v-if="!collapsed" class="q-pa-sm">
      <div class="row q-col-gutter-sm items-end q-mb-sm">
        <q-select
          class="col"
          v-model="source"
          dense
          dark
          filled
          :options="sourceOptions"
          emit-value
          map-options
          label="state source"
        />
        <q-input
          class="col-4"
          v-model.number="numberToLoad"
          dense
          dark
          filled
          type="number"
          :min="1"
          :max="Math.max(1, availableStateNames.length)"
          label="number"
        />
      </div>

      <div class="row q-col-gutter-sm q-mb-sm">
        <q-btn
          class="col"
          color="grey-9"
          dense
          no-caps
          icon="fa-solid fa-rotate"
          label="refresh states"
          :loading="isRefreshing"
          @click="refreshAvailableStates"
        />
        <q-btn
          class="col"
          color="secondary"
          dense
          no-caps
          icon="fa-solid fa-list-check"
          label="select first N"
          @click="selectFirstNStates"
        />
      </div>

      <q-select
        v-model="selectedStateNames"
        :options="availableStateNames"
        multiple
        use-chips
        dense
        dark
        filled
        stack-label
        :max-values="numberToLoad"
        label="states to load"
      />

      <div class="row q-mt-sm justify-between items-center">
        <div class="text-caption text-grey-5">
          selected {{ selectedStateNames.length }} / {{ numberToLoad }}
        </div>
        <q-btn
          color="primary"
          dense
          no-caps
          icon="fa-solid fa-download"
          label="load selected"
          :disable="selectedStateNames.length === 0"
          :loading="isLoading"
          @click="loadSelectedStates"
        />
      </div>

      <q-separator class="q-mt-md q-mb-sm" />

      <div class="text-caption text-grey-4 q-mb-xs">
        loaded states: {{ loadedStates.length }}
      </div>
      <q-list dense bordered separator dark>
        <q-item v-for="state in loadedStates" :key="state.key">
          <q-item-section>
            <q-item-label>{{ state.name }}</q-item-label>
            <q-item-label caption>{{ state.user }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>

<script>
import { useGeneralStore } from "src/stores/general";
import { useUserStore } from "src/stores/user";

export default {
  name: "StateBatchLoaderComponent",
  props: {
    title: {
      type: String,
      default: "STATE BATCH LOADER",
    },
  },
  setup() {
    const user = useUserStore();
    const general = useGeneralStore();

    return {
      user,
      general,
    };
  },
  data() {
    return {
      collapsed: false,
      source: "user",
      sourceOptions: [
        { label: "user states", value: "user" },
        { label: "shared states", value: "shared" },
      ],
      numberToLoad: 3,
      availableStateNames: [],
      selectedStateNames: [],
      loadedStates: [],
      isRefreshing: false,
      isLoading: false,
    };
  },
  methods: {
    sanitizeNumberToLoad() {
      const cap = Math.max(1, this.availableStateNames.length || 1);
      const nextValue = Number.parseInt(this.numberToLoad, 10);

      if (!Number.isFinite(nextValue) || nextValue < 1) {
        this.numberToLoad = 1;
        return;
      }

      this.numberToLoad = Math.min(nextValue, cap);
    },
    trimSelection() {
      if (this.selectedStateNames.length > this.numberToLoad) {
        this.selectedStateNames = this.selectedStateNames.slice(0, this.numberToLoad);
      }
    },
    async fetchStateNames() {
      if (this.source === "shared") {
        return this.fetchSharedStateNames();
      }
      return this.fetchUserStateNames();
    },
    async fetchUserStateNames() {
      const url = `${this.general.apiUrl}/api/states/get_all_user_states?token=${this.user.token}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: this.user.name.toLowerCase(),
          name: "placeholder",
          model_definition: {},
          diagram_definition: { name: "" },
          animation_definition: { name: "" },
          configuration: {},
          events: {},
        }),
      });

      if (response.status !== 200) {
        throw new Error("Could not load user state names from server");
      }
      return response.json();
    },
    async fetchSharedStateNames() {
      const url = `${this.general.apiUrl}/api/states/get_all_shared_states?token=${this.user.token}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: this.user.name.toLowerCase(),
          name: "placeholder",
          model_definition: {},
          diagram_definition: { name: "" },
          animation_definition: { name: "" },
          configuration: {},
          events: {},
        }),
      });

      if (response.status !== 200) {
        throw new Error("Could not load shared state names from server");
      }
      return response.json();
    },
    async refreshAvailableStates() {
      this.isRefreshing = true;
      try {
        const names = await this.fetchStateNames();
        this.availableStateNames = Array.isArray(names) ? names.sort() : [];
        this.sanitizeNumberToLoad();
        this.trimSelection();
      } catch (error) {
        this.availableStateNames = [];
        this.selectedStateNames = [];
        this.$q.notify({
          type: "negative",
          message: error?.message || "Could not refresh states",
        });
      } finally {
        this.isRefreshing = false;
      }
    },
    selectFirstNStates() {
      this.sanitizeNumberToLoad();
      this.selectedStateNames = this.availableStateNames.slice(0, this.numberToLoad);
    },
    async fetchStateByName(name) {
      const endpoint =
        this.source === "shared" ? "get_shared_state" : "get_user_state";
      const url = `${this.general.apiUrl}/api/states/${endpoint}?token=${this.user.token}`;
      const payload =
        this.source === "shared"
          ? {
              name,
              model_definition: {},
              diagram_definition: { name: "" },
              animation_definition: { name: "" },
              configuration: {},
              events: {},
            }
          : {
              user: this.user.name.toLowerCase(),
              name,
              model_definition: {},
              diagram_definition: { name: "" },
              animation_definition: { name: "" },
              configuration: {},
              events: {},
            };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status !== 200) {
        throw new Error(`Could not load state: ${name}`);
      }

      return response.json();
    },
    async loadSelectedStates() {
      this.isLoading = true;
      this.loadedStates = [];
      const selected = this.selectedStateNames.slice(0, this.numberToLoad);

      try {
        for (const stateName of selected) {
          const loaded = await this.fetchStateByName(stateName);
          this.loadedStates.push({
            key: loaded._id || `${loaded.user || "shared"}-${loaded.name}`,
            name: loaded.name,
            user: loaded.user || "shared",
            payload: loaded,
          });
        }

        this.$emit("states-loaded", this.loadedStates.map((entry) => entry.payload));
      } catch (error) {
        this.$q.notify({
          type: "negative",
          message: error?.message || "Could not load selected states",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
  watch: {
    source() {
      this.selectedStateNames = [];
      this.loadedStates = [];
      this.refreshAvailableStates();
    },
    numberToLoad() {
      this.sanitizeNumberToLoad();
      this.trimSelection();
    },
  },
  mounted() {
    this.refreshAvailableStates();
  },
};
</script>

<style></style>
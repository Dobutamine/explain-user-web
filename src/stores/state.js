import { defineStore } from "pinia";

export const useStateStore = defineStore("state", {
  state: () => ({
    user: "",
    name: "",
    description: "",
    protected: false,
    shared: false,
    shared_category: "",
    diagram_definition: {
      settings: {},
      components: {}
    },
    animation_definition: {
      settings: {},
      components: {}
    },
    model_definition: {},
    configuration: {},
    events: {},
    saved: false,
    default: true,
  }),

  getters: {},

  actions: {
    renameState(newName, userName) {
      if (newName !== this.name) {
        this.name = newName;
        this.default = false;
        this.protected = false;
        this.user = userName.toLowerCase();
        this.saved = false;
      }
    },
    async getAllSharedStatesFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/states/get_all_shared_states?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        return data;
      } else {
        return false;
      }
    },
    async getAllUserStatesFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/states/get_all_user_states?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        return data;
      } else {
        return false;
      }
    },
    async getStateFromServer(apiUrl, userName, stateName, token) {
      const url = `${apiUrl}/api/states/get_user_state?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
          name: stateName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.user = data.user.toLowerCase();
        this.name = data.name;
        this.description = data.description;
        this.protected = data.protected;
        this.shared = data.shared;
        this.shared_category = data.shared_category || "";
        this.diagram_definition = data.diagram_definition;
        this.animation_definition = data.animation_definition;
        this.model_definition = data.model_definition;
        this.configuration = data.configuration;
        this.events = data.events;
        return true;
      } else {
        return false;
      }
    },
    async getSharedStateFromServer(apiUrl, userName, stateName, token) {
      const url = `${apiUrl}/api/states/get_shared_state?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: stateName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.name = data.name + "_" + userName.toLowerCase();
        this.description = data.description;
        // make this the users own copy
        this.protected = false;
        this.shared = false;
        this.shared_category = "";
        this.diagram_definition = data.diagram_definition;
        this.animation_definition = data.animation_definition;
        this.model_definition = data.model_definition;
        this.configuration = data.configuration;
        this.events = data.events;
        return true;
      } else {
        return false;
      }
    },
    async saveStateToServer(apiUrl, userName, token) {
      if (!this.protected) {
        const url = `${apiUrl}/api/states/update_state?token=${token}`;
        console.log("Saving state to server with user: " + userName.toLowerCase());
        console.log("Saving state to server with name: " + this.name);
        if (!this.shared_category) {
          this.shared_category = "General";
        }
        let response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user: userName.toLowerCase(),
            name: this.name,
            description: this.description,
            protected: this.protected,
            shared: this.shared,
            shared_category: this.shared_category,
            diagram_definition: this.diagram_definition,
            animation_definition: this.animation_definition,
            model_definition: this.model_definition,
            configuration: this.configuration,
            events: this.events
          }),
        });

        if (response.status === 200) {
          return { result: true, message: "State saved" };
        } else {
          console.log(response);
          return {
            result: false,
            message:
              "State could not saved! Server error. Contact administrator.",
          };
        }
      } else {
        return {
          result: false,
          message:
            "State is protected. Please store state under a different name.",
        };
      }
    }
  },
});

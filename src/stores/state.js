import { defineStore } from "pinia";

export const useStateStore = defineStore("state", {
  state: () => ({
    explain_version: "",
    user: "",
    name: "",
    description: "",
    protected: false,
    shared: false,
    diagram_definition: {
      name: ""
    },
    animation_definition: {
      name: ""
    },
    model_definition: {},
    configuration: {},
    events: {},
    saved: false,
    default: true,
    prev_diagram_definition: {},
    prev_animation_definition: {}
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
    async getDefaultStateFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/states/get_user_state?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: "default",
          name: "default_neonate",
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.explain_version = data.explain_version;
        this.user = data.user.toLowerCase();
        this.name = data.name;
        this.description = data.description;
        this.protected = data.protected;
        this.shared = data.shared;
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
        this.explain_version = data.explain_version;
        this.user = data.user.toLowerCase();
        this.name = data.name;
        this.description = data.description;
        this.protected = data.protected;
        this.shared = data.shared;
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
    async getSharedStateFromServer(apiUrl, stateName, token) {
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
        this.explain_version = data.explain_version;
        this.user = data.user.toLowerCase();
        this.name = data.name;
        this.description = data.description;
        this.protected = true;
        this.shared = data.shared;
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
        let response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            explain_version: this.explain_version,
            user: userName.toLowerCase(),
            name: this.name,
            description: this.description,
            protected: this.protected,
            shared: this.shared,
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

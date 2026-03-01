import { defineStore } from "pinia";

export const useEventStore = defineStore("event", {
  event: () => ({
    explain_version: "",
    user: "",
    name: "",
    description: "",
    protected: false,
    shared: false,
    event_definition: {
        name: "",
        description: "",
        task_list: [],
    },
    saved: false,
    default: true
  }),

  getters: {},

  actions: {
    renameEvent(newName, userName) {
      if (newName !== this.name) {
        this.name = newName;
        this.default = false;
        this.protected = false;
        this.user = userName.toLowerCase();
        this.saved = false;
      }
    },
    async getAllSharedEventsFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/events/get_all_shared_events?token=${token}`;
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
    async getAllUserEventsFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/events/get_all_user_events?token=${token}`;
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
    async getEventFromServer(apiUrl, userName, eventName, token) {
      const url = `${apiUrl}/api/events/get_user_event?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
          name: eventName,
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
        this.event_definition = data.event_definition;
        return true;
      } else {
        return false;
      }
    },
    async getSharedEventFromServer(apiUrl, userName, eventName, token) {
      const url = `${apiUrl}/api/events/get_shared_event?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.explain_version = data.explain_version;
        this.name = data.name + "_" + userName.toLowerCase();
        this.description = data.description;
        // make this the users own copy
        this.protected = false;
        this.shared = false;
        this.event_definition = data.event_definition;
        return true;
      } else {
        return false;
      }
    },
    async saveEventToServer(apiUrl, userName, token) {
      if (!this.protected) {
        const url = `${apiUrl}/api/events/update_event?token=${token}`;
        console.log("Saving event to server with user: " + userName.toLowerCase());
        console.log("Saving event to server with name: " + this.name);
        console.log("Event protected: " + this.protected);
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
            event_definition: this.event_definition
          }),
        });

        if (response.status === 200) {
          return { result: true, message: "Event saved" };
        } else {
          console.log(response);
          return {
            result: false,
            message:
              "Event could not saved! Server error. Contact administrator.",
          };
        }
      } else {
        return {
          result: false,
          message:
            "Event is protected. Please store event under a different name.",
        };
      }
    }
  },
});

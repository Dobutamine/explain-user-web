import { defineStore } from "pinia";

export const useAnimationStore = defineStore("animation", {
  animation: () => ({
    user: "",
    name: "",
    protected: false,
    shared: false,
    animation_definition: {
      settings: {
        "name": "baseline_neonate_diagram_cindycloin",
        "name": "baseline_neonate_animation",
        "owner": "Timothy Antonius",
        "type": "explain_animation",
        "backgroundColor": 3355443,
        "editingMode": 1,
        "scaling": 1,
        "speed": 1,
        "grid": true,
        "gridSize": 10,
        "skeleton": false,
        "skeletonColor": 4473924,
        "pathColor": 4473924,
        "radius": 0.6,
        "xOffset": 0,
        "yOffset": -10,
        "shuntOptionsVisible": false
      },
      components: {},
    }
  }),

  getters: {},

  actions: {
    renameAnimation(newName, userName) {
      if (newName !== this.name) {
        this.name = newName;
        this.default = false;
        this.protected = false;
        this.user = userName.toLowerCase();
        this.saved = false;
      }
    },
    async getAllUserAnimationsFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/animations/get_all_user_animations?token=${token}`;
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
    async getAnimationFromServer(apiUrl, userName, animationName, token) {
      const url = `${apiUrl}/api/animations/get_user_animation?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
          name: animationName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.animation_definition = data.animation_definition;
        return true;
      } else {
        return false;
      }
    },
    async getSharedAnimationFromServer(apiUrl, userName, animationName, token) {
      const url = `${apiUrl}/api/animations/get_user_animation?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: "timothy",
          name: "baseline_neonate_animation",
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.animation_definition = data.animation_definition;
        this.name = data.name + "_" + userName.toLowerCase();
        this.animation_definition.settings.name = data.name + "_" + userName.toLowerCase();
        this.shared = false;
        this.protected = false;
        return true;
      } else {
        return false;
      }
    },
    async saveAnimationToServer(apiUrl, userName, animationName, token) {
      if (!this.protected) {
        this.name = animationName;
        const url = `${apiUrl}/api/animations/update_animation?token=${token}`;
        let response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userName.toLowerCase(),
            name: this.name,
            protected: this.protected,
            shared: this.shared,
            animation_definition: this.animation_definition
          }),
        });

        if (response.status === 200) {
          return { result: true, message: "Animation saved" };
        } else {
          return {
            result: false,
            message:
              "Animation could not saved! Server error. Contact administrator.",
          };
        }
      } else {
        return {
          result: false,
          message:
            "Animation is protected. Please store animation under a different name.",
        };
      }
    }
  },
});

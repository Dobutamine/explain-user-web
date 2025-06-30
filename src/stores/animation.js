import { defineStore } from "pinia";

export const useAnimationStore = defineStore("animation", {
  animation: () => ({
    user: "",
    name: "",
    protected: false,
    shared: false,
    animation_definition: {
      settings: {},
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

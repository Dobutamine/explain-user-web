import { defineStore } from "pinia";

export const useAnimationStore = defineStore("animation", {
  animation: () => ({
    user: "",
    name: "",
    protected: false,
    shared: false,
    dateCreated: "r",
    dateLastUpdated: "r",
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
        this.dateCreated = new Date();
        this.dateCreated = this.dateCreated.toISOString();
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
        this.dateCreated = new Date();
        this.dateCreated = this.dateCreated.toISOString();
        this.dateLastUpdated = new Date();
        this.dateLastUpdated = this.dateLastUpdated.toISOString();

        console.log(this.animation_definition)
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
            dateCreated: this.dateCreated,
            dateLastUpdated: this.dateLastUpdated,
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

import { defineStore } from "pinia";

export const useDiagramStore = defineStore("diagram", {
  diagram: () => ({
    user: "",
    name: "",
    protected: false,
    shared: false,
    dateCreated: "r",
    dateLastUpdated: "r",
    diagram_definition: {
      settings: {},
      components: {},
    }
  }),

  getters: {},

  actions: {
    renameDiagram(newName, userName) {
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
    async getAllUserDiagramsFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/diagrams/get_all_user_diagrams?token=${token}`;
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
    async getDiagramFromServer(apiUrl, userName, diagramName, token) {
      const url = `${apiUrl}/api/diagrams/get_user_diagram?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
          name: diagramName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.diagram_definition = data.diagram_definition;
        this.animation_definition = data.animation_definition;
        return true;
      } else {
        return false;
      }
    },
    async saveDiagramToServer(apiUrl, userName, diagramName, token) {
      if (!this.protected) {
        this.name = diagramName;
        this.dateCreated = new Date();
        this.dateCreated = this.dateCreated.toISOString();
        this.dateLastUpdated = new Date();
        this.dateLastUpdated = this.dateLastUpdated.toISOString();

        console.log(this.diagram_definition)
        const url = `${apiUrl}/api/diagrams/update_diagram?token=${token}`;
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
            diagram_definition: this.diagram_definition
          }),
        });

        if (response.status === 200) {
          return { result: true, message: "Diagram saved" };
        } else {
          return {
            result: false,
            message:
              "Diagram could not saved! Server error. Contact administrator.",
          };
        }
      } else {
        return {
          result: false,
          message:
            "Diagram is protected. Please store diagram under a different name.",
        };
      }
    }
  },
});

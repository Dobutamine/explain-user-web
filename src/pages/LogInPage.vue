<template>
  <q-page padding class="bg-black">

    <div v-if="login" class="row justify-center">
      <q-img
        src="explain-labs-logo.svg"
        class="row justify-center"
        style="width: 40%"
      />
    </div>
    <div class="row">
      <div class="col-4"></div>


      <q-card class="col" dark bordered>

        <div v-if="login" class="row justify-center items-start q-mt-lg">
            <div class="col-1"></div>
              <div class="col text-center">
                <q-input class="row" v-model="name" :value="name" stack-label autofocus label="USER NAME">
                </q-input>
                <q-input v-if="newUserEntry" class="row" v-model="email" type="email" :value="email" stack-label autofocus label="EMAIL">
                </q-input>
                <q-input v-if="newUserEntry" class="row" v-model="institution" :value="institution" stack-label autofocus label="INSTITUTION">
                </q-input>
                <q-select v-if="newUserEntry" class="row" v-model="subscriptionType" :options="subscriptionTypes" readonly stack-label autofocus
                  label="SUBSCRIPTION PLAN">
                </q-select>
                <q-input v-if="login" class="row" v-model="password" type="password" :value="id" stack-label label="PASSWORD">
                </q-input>
                <q-card v-if="errorText != ''" class="row dark bordered flat q-pa-sm q-ma-md">
                  {{ errorText }}
                </q-card>
                <div class="q-mt-lg col text-center">
                  <q-btn v-if="!newUserEntry" class="q-pl-lg q-pr-lg bg-blue-grey-10" @click="LogIn"
                    style="width: 150px;font-size: 16px;" size="sm">LOG IN</q-btn>
                  <q-btn class="q-ml-lg q-pl-lg q-pr-lg bg-blue-grey-10" @click="showRegistration"
                    style="width: 150px;font-size: 16px;" size="sm">REGISTER</q-btn>
                  <q-btn v-if="newUserEntry" class="q-ml-lg q-pl-lg q-pr-lg bg-blue-grey-10" @click="cancelRegistration"
                    style="width: 150px;font-size: 16px;" size="sm">CANCEL</q-btn>
                </div>

              </div>


            <div class="col-1"></div>
        </div>


        <div class="row justify-center items-start q-ma-lg">
          <div class="col text-center"></div>
          <div class="col text-center">

          </div>
          <div class="col text-center"></div>
        </div>

      </q-card>
      <div class="col-4"></div>
    </div>
  </q-page>
</template>

<script>
import { explain } from 'src/boot/explain';
import { useUserStore } from "src/stores/user";
import { useGeneralStore } from "../stores/general";
import { useStateStore } from "src/stores/state";

//import axios from "axios";
/* eslint-disable */
export default {
  setup() {
    const user = useUserStore();
    const general = useGeneralStore();
    const state = useStateStore();

    return {
      user,
      state,
      general,
    };
  },
  data() {
    return {
      id: "",
      name: "",
      email: "",
      institution: "",
      admin: false,
      password: "",
      subscriptionTypes: ["free", "premium", "institution"],
      subscriptionType: "free",
      subscriptionStartDate: "",
      subscriptionEndDate: "",
      subscriptionAutoRenew: false,
      additionalData: {},
      errorText: "",
      showChoices: false,
      newUserEntry: false,
      login: true,
      log_in: null
    };
  },
  methods: {
    validateRegisterRequest() {
      if (this.name === "") {
        this.errorText = "Please enter a username!";
        return false;
      }
      if (this.email === "") {
        this.errorText = "Please enter an email address!";
        return false;
      }
      if (this.institution === "") {
        this.errorText = "Please enter an institution!";
        return false;
      }
      if (this.password === "") {
        this.errorText = "Please enter a password!";
        return false;
      }

      return true;
    },
    registerNewUser() {
      if (!this.validateRegisterRequest()) {
        return;
      }
      this.user.registerNewUser(
        this.general.apiUrl,
        this.name,
        this.email,
        this.password,
        this.admin,
        this.institution,
        this.subscriptionType,
        this.additionalData
      );
      this.newUserEntry = false;
    },
    showRegistration() {
      if (!this.newUserEntry) {
        this.newUserEntry = true;
      } else {
        this.registerNewUser();
      }
    },
    cancelRegistration() {
      this.id = "";
      this.newUserEntry = false;
      this.login = true;
      this.email = "";
      this.password = "";
      this.name = "";
      this.institution = "";
      this.subscriptionType = "free";
      this.subscriptionStartDate = "";
      this.subscriptionEndDate = "";
      this.subscriptionAutoRenew = false;
      this.additionalData = {};
    },
    LogIn() {
      this.user.logIn(this.general.apiUrl, this.name, this.password);
    },
    LogOut() {
      this.id = "";
      this.showChoices = false;
      this.login = true;
      this.email = "";
      this.password = "";
      this.name = "";
      this.institution = "";
      this.subscriptionType = "free";
      this.subscriptionStartDate = "";
      this.subscriptionEndDate = "";
      this.subscriptionAutoRenew = false;
      this.additionalData = {};
      this.errorText = "";
    },
    LoadDefaultState() {
      this.state.getStateFromServer(this.general.apiUrl, this.user.name, this.user.defaultState, this.user.token);
    },
    LoadGeneralDefaultState() {
      this.state.getDefaultStateFromServer(this.general.apiUrl, this.user.name, this.user.token);
    },
    pressedEnter() {
      if (this.newUserEntry) {
        this.registerNewUser();
      } else {
        this.LogIn();
      }
    },
  },
  beforeUnmount() {
    this.log_in();
  },
  mounted() {
    this.$q.dark.set(true);

    /*
    This code sets up an action listener for a user login functionality. Here's what it does step by step:

    It creates an action subscriber that listens to actions dispatched from a user store (Pinia) of the Vue.js application.
    The listener specifically watches for an action named "logIn" to be dispatched.

    When the "logIn" action occurs, it executes the callback function after the action completes.

    This is a typical pattern in frontend applications to handle authentication flows, especially in Vue applications using Pinia for state management. The $onAction API is a Pinia feature that allows subscribing to store actions.
    */
    this.log_in = this.user.$onAction(({ name, after }) => {
      if (name === "logIn") {
        after((result) => {
          if (result) {
            this.errorText = "";
            console.log(`User ${this.user.name} logged in.`)
            // load the default state for this user
            this.LoadDefaultState()
          } else {
            this.errorText = "Invalid username or password!";
          }
        });
      }
    });

    this.load_default_state = this.state.$onAction(({ name, after }) => {
      if (name === "getStateFromServer") {
        after((result) => {
          if (result) {
            this.errorText = ""
            console.log(`State ${this.state.name} loaded`)
            explain.build(this.state.model_definition);
            if (this.user.defaultState === this.name) {
              this.default = true;
            } else {
              this.default = false;
            }
            this.state.saved = true;
            this.$router.push("/explain");
          } else {
            this.errorText = "Cannot find default model state on the server! Loading general default state";
            this.LoadGeneralDefaultState()
          }
        });
      }
    });
    this.load_shared_state = this.state.$onAction(({ name, after }) => {
      if (name === "getSharedStateFromServer") {
        after((result) => {
          if (result) {
            this.errorText = ""
            console.log(`State ${this.state.name} loaded`)
            explain.build(this.state.model_definition);
            if (this.user.defaultState === this.name) {
              this.default = true;
            } else {
              this.default = false;
            }
            this.state.saved = true;
            this.$router.push("/explain");
          } else {
            this.errorText = "Cannot find shared model state on the server! Loading general default state";
            this.LoadGeneralDefaultState()
          }
        });
      }
    });

    this.load_general_default_state = this.state.$onAction(({ name, after }) => {
      if (name === "getDefaultStateFromServer") {
        after((result) => {
          if (result) {
            this.errorText = ""
            console.log(`Default state ${this.state.name} loaded`)
            explain.build(this.state.model_definition);
            this.state.saved = true;
            this.$router.push("/explain");
          } else {
            this.errorText = "Cannot find the general default model state on the server!";
          }
        });
      }
    });

    this.$bus.on("registered", () => {
      this.newUserEntry = false;
    });

    if (process.env.DEV) {
      //override login for developement development
      this.password = "y5qkqjed";
      this.name = "timothy_exp";
      this.user.logIn(this.general.apiUrl, this.name, this.password);
    }
  },
};
</script>

<style>
a:link {
  color: grey;
  background-color: transparent;
  text-decoration: none;
}

a:visited {
  color: grey;
  background-color: transparent;
  text-decoration: none;
}

a:hover {
  color: red;
  background-color: transparent;
  text-decoration: underline;
}

a:active {
  color: yellow;
  background-color: transparent;
  text-decoration: underline;
}
</style>

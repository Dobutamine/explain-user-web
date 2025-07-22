<template>
  <q-page>
    <div class="q-pa-sm" style="background-color: black; min-height: 100vh;">
      <div class="row">
        <div class="col-3">
          <q-tabs v-model="tab_left" dense class="text-white" active-color="primary" indicator-color="primary"
            narrow-indicator outside-arrows @update:model-value="tabLeftChanged">
            <q-tab name="interventions"><q-icon name="fa-solid fa-sliders" size="xs"></q-icon><q-tooltip>interventions</q-tooltip>
            </q-tab>
            <q-tab name="model_editor"><q-icon name="fa-solid fa-wrench" size="xs"></q-icon><q-tooltip>model editor</q-tooltip>
            </q-tab>
            <q-tab name="model_builder"><q-icon name="fa-solid fa-pen-to-square" size="xs"></q-icon><q-tooltip>model builder</q-tooltip>
            </q-tab>
           <q-tab name="diagram_editor"><q-icon name="fa-solid fa-diagram-project" size="xs"></q-icon><q-tooltip>diagram editor</q-tooltip>
            </q-tab>
            <!-- <q-tab name="animation_editor"><q-icon name="fa-solid fa-person" size="xs"></q-icon><q-tooltip>animation editor</q-tooltip>
            </q-tab> -->
          </q-tabs>
          <q-tab-panels v-model="tab_left" keep-alive style="background-color: black">
            <q-tab-panel name="model_editor">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 1.0
              }">
              <ModelEditor title="MODEL EDITOR"></ModelEditor>
              <!-- <ModelEditor title="MODEL EDITOR B"></ModelEditor> -->
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="model_builder">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 1.0
              }">
              <ModelBuilderComponent title="MODEL BUILDER"></ModelBuilderComponent>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="animation_editor">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <AnimationEditor></AnimationEditor>
                <!-- <div v-for="item in state.configuration.enabled_controllers.circulation">
                  <NiceController :config="state.configuration.controllers[item]"></NiceController>
                </div> -->

              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="diagram_editor">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <DiagramEditorComponent></DiagramEditorComponent>
                <!-- <div v-for="item in state.configuration.enabled_controllers.circulation">
                  <NiceController :config="state.configuration.controllers[item]"></NiceController>
                </div> -->

              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="interventions">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
              <ControllerComponent title="INTERVENTIONS"></ControllerComponent>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <div class="col-6">
          <q-tabs v-model="tab_center" dense class="text-white" active-color="primary" indicator-color="primary"
           narrow-indicator outside-arrows @update:model-value="tabCenterChanged">

            <q-tab name="diagram">
              <q-icon name="fa-solid fa-diagram-project" size="xs"></q-icon>
              <q-tooltip>diagram</q-tooltip>
            </q-tab>

            <!-- <q-tab name="animation">
              <q-icon name="fa-solid fa-person" size="xs"></q-icon>
              <q-tooltip>animation</q-tooltip>
            </q-tab> -->

            <q-tab name="heart">
              <q-icon name="fa-solid fa-heart" size="xs"></q-icon>
              <q-tooltip>cath lab</q-tooltip>
            </q-tab>

            <q-tab name="ventilator">
              <q-icon name="fa-solid fa-lungs" size="xs"></q-icon>
              <q-tooltip>mechanical ventilator</q-tooltip>
            </q-tab>

            <q-tab name="ecls">
              <!-- <q-icon name="fa-solid fa-lungs" size="xs"></q-icon> -->
              ECLS
              <q-tooltip>extracorporeal life support</q-tooltip>
            </q-tab>


            <q-tab name="time_chart">
              <q-icon name="fa-solid fa-chart-line" size="xs"></q-icon>
              <q-tooltip>time chart</q-tooltip>
            </q-tab>

            <q-tab name="xy_chart">
              <q-icon name="fa-solid fa-chart-area" size="xs"></q-icon>
              <q-tooltip>xy chart</q-tooltip>
            </q-tab>

            <q-tab name="task_scheduler">
              <q-icon name="fa-solid fa-list-check" size="xs"></q-icon>
              <q-tooltip>event scheduler</q-tooltip>
            </q-tab>
          </q-tabs>


          <q-tab-panels v-model="tab_center" keep-alive style="background-color: black">

            <q-tab-panel name="animation">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <AnimationComponent :alive="animation_alive">
                </AnimationComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="diagram">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <DiagramComponent :alive="diagram_alive">
                </DiagramComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="time_chart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <TimeBasedChartComponent :alive="chart_alive"></TimeBasedChartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="ventilator">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <VentilatorComponent :alive="ventilator_alive"></VentilatorComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="ecls">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <EclsComponent :alive="ecls_alive"></EclsComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="heart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <HeartComponent :alive="heart_alive"></HeartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="xy_chart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <XYChartComponent :alive="xy_alive" title="XY Graph" :presets={}></XYChartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="task_scheduler">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <TaskScheduler></TaskScheduler>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <div class="col-3">
          <q-tabs v-model="tab_right" dense class="text-white" active-color="primary" indicator-color="primary"
            narrow-indicator outside-arrows @update:model-value="tabRightChanged">
            <q-tab name="numerics">
              <q-icon name="fa-solid fa-desktop" size="xs"></q-icon>
              <q-tooltip>monitoring</q-tooltip>
            </q-tab>
            <q-tab name="numerics_editor">
              <q-icon name="fa-solid fa-wrench" size="xs"></q-icon>
              <q-tooltip>monitoring editor</q-tooltip>
            </q-tab>

          </q-tabs>
          <q-tab-panels v-model="tab_right" style="background-color: black">
            <q-tab-panel name="numerics">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <BigNumbersComponent></BigNumbersComponent>
                <div :key="monitor_redraw" >
                  <div v-for="monitor in state.configuration.monitors">
                    <div>
                      <NumericsComponent v-if="monitor.enabled" :title="monitor.title"
                        :collapsed="monitor.collapsed"
                        :parameters="monitor.parameters"></NumericsComponent>
                    </div>
                  </div>
                </div>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="numerics_editor">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
              <NumericsEditor title="MONITOR EDITOR"></NumericsEditor>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>

  </q-page>
</template>

<script>
import { explain } from 'src/boot/explain';
import { defineComponent } from 'vue'
import { useUserStore } from 'src/stores/user';
import { useStateStore } from 'src/stores/state';
import NumericsComponent from "src/components/NumericsComponent.vue";
import ModelEditor from "src/components/ModelEditorComponent.vue"
import TimeBasedChartComponent from 'src/components/TimeBasedChartComponent.vue';
import VentilatorComponent from 'src/components/VentilatorComponent.vue';
import XYChartComponent from 'src/components/XYChartComponent.vue';
import HeartComponent from 'src/components/HeartComponent.vue';
import DiagramComponent from 'src/components/DiagramComponent.vue';
import NiceController from 'src/components/NiceController.vue';
import BigNumbersComponent from 'src/components/BigNumbersComponent.vue';
import DiagramEditorComponent from 'src/components/DiagramEditor.vue';
import TaskScheduler from 'src/components/TaskScheduler.vue';
import EclsComponent from 'src/components/EclsComponent.vue';
import AnimationComponent from 'src/components/AnimationComponent.vue';
import AnimationEditor from 'src/components/AnimationEditor.vue';
import ModelBuilderComponent from 'src/components/ModelBuilderComponent.vue';
import ControllerComponent from 'src/components/ControllerComponent.vue';
import NumericsEditor from 'src/components/NumericsEditor.vue';


export default defineComponent({
  name: 'MainPage',
  setup() {
    const state = useStateStore();
    const user = useUserStore();
    let monitor_redraw = 1;

    return {
      state,
      user,
      monitor_redraw
    }
  },
  components: {
    NumericsComponent,
    BigNumbersComponent,
    ModelEditor,
    ModelBuilderComponent,
    TimeBasedChartComponent,
    VentilatorComponent,
    XYChartComponent,
    HeartComponent,
    DiagramComponent,
    NiceController,
    DiagramEditorComponent,
    TaskScheduler,
    EclsComponent,
    AnimationComponent,
    AnimationEditor,
    ControllerComponent,
    NumericsEditor
  },
  data() {
    return {
      tab_left: "interventions",
      tab_center: "diagram",
      tab_right: "numerics",
      chart_alive: true,
      ventilator_alive: true,
      heart_alive: false,
      ecls_alive:true,
      xy_alive: true,
      diagram_alive: true,
      screen_offset: 135.0,
      screen_height: 100.0
    }
  },
  methods: {
    tabLeftChanged() {
      explain.getModelState()
    },
    tabRightChanged() {
      explain.getModelState()
    },
    tabCenterChanged(tabName) {
      explain.getModelState()
      switch (tabName) {
        case "animation":
          this.animation_alive = true
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          this.ecls_alive = false
          break;
        case "ventilator":
          this.animation_alive = false
          this.ventilator_alive = true
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          this.ecls_alive = false
          break;
        case "ecls":
          this.animation_alive = false
          this.ecls_alive = true
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          break;
        case "heart":
          this.animation_alive = false
          this.ventilator_alive = false
          this.heart_alive = true
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          this.ecls_alive = false
          break;
        case "time_chart":
          this.animation_alive = false
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = true
          this.xy_alive = false
          this.diagram_alive = false
          this.ecls_alive = false
          break;
        case "xy_chart":
          this.animation_alive = false
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = true
          this.diagram_alive = false
          this.ecls_alive = false
          break;
        case "diagram":
          this.animation_alive = false
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = true
          this.ecls_alive = false
          break;
        case "placenta":
          this.animation_alive = false
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          this.ecls_alive = false
          break;


      }
    },
    updateWatchlist() {
      // update the watchlist by looking at the enabled monitors
        Object.values(this.state.configuration.monitors).forEach((monitor) => {
          if (monitor.enabled) {
            monitor.parameters.forEach((p) => {
              explain.watchModelPropsSlow([...p.props])
            })
          }
        })
    },
    modelReady() {
      // make sure the modelengine watches everything which is visible on the main screen.
      this.updateWatchlist()

      // get the model state
      explain.getModelState()
    },
    redrawMonitors() {
      this.monitor_redraw += 1
    },
    onDiagramTap(e) {
      switch (this.tab_left) {
        case "diagram_editor":
          this.$bus.emit("select_diagram", e.diagram)
          break;
        case "model_editor":
          this.$bus.emit("select_model", e.model)
          break;
      }
    }
  },
  beforeUnmount() {
    this.$bus.off("reset", this.updateWatchlist)
    this.$bus.off("model_ready", this.modelReady)
    this.$bus.off("redraw_monitors", this.redrawMonitors)
    this.$bus.off("sprite_tapped", (e) => this.onDiagramTap(e))
  },
  mounted() {
    // return if the user is not logged in
    if (!this.user.loggedIn) {
      this.$router.push("/login");
    }

    // set the dark theme
    this.$q.dark.set(true);

    // get the screen height
    let h = this.$q.screen.height - this.screen_offset;
    this.screen_height = "height: " + h + "px; background: black";

    // if the mode is ready prepare
    this.$bus.on("model_ready", this.modelReady)

    // if the models resets make sure the watchlist is up to date
    this.$bus.on("reset", this.modelReady)

    // redraw monitors event
    this.$bus.on("redraw_monitors", this.redrawMonitors)

    // listen for sprite tap
    this.$bus.on("sprite_tapped", (e) => this.onDiagramTap(e))

  }
})
</script>

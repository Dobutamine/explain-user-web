<template>
  <q-page>
    <div class="q-pa-sm" style="background-color: black; min-height: 100vh;">
      <div class="row">
        <div class="col-3">
          <q-tabs v-model="tab_left" dense class="text-white" active-color="primary" indicator-color="primary"
            narrow-indicator outside-arrows @update:model-value="tabLeftChanged">
            <q-tab v-if="state.configuration.tabs?.demo?.enabled" name="demo">
              <q-icon name="fa-solid fa-flask" size="xs"></q-icon>
              <q-tooltip>demo</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.controllers?.enabled" name="controllers"><q-icon name="fa-solid fa-sliders" size="xs"></q-icon><q-tooltip>controllers</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.task_scheduler?.enabled" name="task_scheduler">
              <q-icon name="fa-solid fa-list-check" size="xs"></q-icon>
              <q-tooltip>event scheduler</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.ventilator?.enabled" name="ventilator">
              <q-icon name="fa-solid fa-lungs" size="xs"></q-icon>
              <q-tooltip>mechanical ventilator</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.ecls?.enabled" name="ecls">
              <!-- <q-icon name="fa-solid fa-lungs" size="xs"></q-icon> -->
              ECLS
              <q-tooltip>extracorporeal life support</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.model_editor?.enabled" name="model_editor"><q-icon name="fa-solid fa-wrench" size="xs"></q-icon><q-tooltip>model editor</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.model_builder?.enabled" name="model_builder"><q-icon name="fa-solid fa-pen-to-square" size="xs"></q-icon><q-tooltip>model builder</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.scaler?.enabled" name="scaler"><q-icon name="fa-solid fa-weight-scale" size="xs"></q-icon><q-tooltip>model scaler</q-tooltip>
            </q-tab>

          </q-tabs>
          <q-tab-panels v-model="tab_left" keep-alive style="background-color: black">
            <q-tab-panel v-if="state.configuration.tabs?.demo?.enabled" name="demo">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
              <DemoComponent title="DEMO COMPONENT"></DemoComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel v-if="state.configuration.tabs?.model_editor?.enabled" name="model_editor">
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
            
            <q-tab-panel v-if="state.configuration.tabs?.ventilator?.enabled" name="ventilator">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <VentilatorComponent :alive="ventilator_alive"
                  :collapsed="state.configuration.tabs?.ventilator?.collapsed"></VentilatorComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel v-if="state.configuration.tabs?.ecls?.enabled" name="ecls">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <EclsControllerComponent :alive="ecls_alive"
                  :collapsed="state.configuration.tabs?.ecls?.collapsed"></EclsControllerComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel v-if="state.configuration.tabs?.model_builder?.enabled" name="model_builder">
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

            <q-tab-panel v-if="state.configuration.tabs?.scaler?.enabled" name="scaler">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <ScalerComponent></ScalerComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel v-if="state.configuration.tabs?.controllers?.enabled" name="controllers">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
              <ControllerComponent title="CONTROLLERS"></ControllerComponent>
              </q-scroll-area>
            </q-tab-panel>
            
            <q-tab-panel v-if="state.configuration.tabs?.task_scheduler?.enabled" name="task_scheduler">
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

        <div class="col-6">
          <q-tabs v-model="tab_center" dense class="text-white" active-color="primary" indicator-color="primary"
           narrow-indicator outside-arrows @update:model-value="tabCenterChanged">

            <q-tab v-if="state.configuration.tabs?.diagram?.enabled" name="diagram">
              <q-icon name="fa-solid fa-diagram-project" size="xs"></q-icon>
              <q-tooltip>diagram</q-tooltip>
            </q-tab>

            <q-tab v-if="state.configuration.tabs?.animation?.enabled" name="animation">
              <q-icon name="fa-solid fa-person" size="xs"></q-icon>
              <q-tooltip>animation</q-tooltip>
            </q-tab>


            <q-tab v-if="state.configuration.tabs?.time_chart?.enabled" name="time_chart">
              <q-icon name="fa-solid fa-chart-line" size="xs"></q-icon>
              <q-tooltip>time chart</q-tooltip>
            </q-tab>


            <q-tab v-if="state.configuration.tabs?.loop_chart?.enabled" name="loop_chart">
              <q-icon name="fa-solid fa-circle-notch" size="xs"></q-icon>
              <q-tooltip>loop chart</q-tooltip>
            </q-tab>


          </q-tabs>


          <q-tab-panels v-model="tab_center" keep-alive style="background-color: black">

          <q-tab-panel v-if="state.configuration.tabs?.animation?.enabled" name="animation">
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

            <q-tab-panel v-if="state.configuration.tabs?.diagram?.enabled" name="diagram">
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

            <q-tab-panel v-if="state.configuration.tabs?.time_chart?.enabled" name="time_chart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <RealtimeChart
                  :alive="chart_alive"
                  :default-autoscale="true"
                  :default-rt-window="5"
                  chart-title="Realtime Chart"
                />

              </q-scroll-area>
            </q-tab-panel>


            <q-tab-panel v-if="state.configuration.tabs?.loop_chart?.enabled" name="loop_chart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <LoopChart
                  :alive="loop_alive"
                  chart-title="Loop Chart"
                  :default-autoscale="true"
                  :default-rt-window="3"
                />
              </q-scroll-area>
            </q-tab-panel>


          </q-tab-panels>
        </div>

        <div class="col-3">
          <q-tabs v-model="tab_right" dense class="text-white" active-color="primary" indicator-color="primary"
            narrow-indicator outside-arrows @update:model-value="tabRightChanged">
            <q-tab v-if="state.configuration.tabs?.numerics?.enabled" name="numerics">
              <q-icon name="fa-solid fa-desktop" size="xs"></q-icon>
              <q-tooltip>monitoring</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.numerics_editor?.enabled" name="numerics_editor">
              <q-icon name="fa-solid fa-wrench" size="xs"></q-icon>
              <q-tooltip>monitoring editor</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.diagram_editor?.enabled" name="diagram_editor"><q-icon name="fa-solid fa-diagram-project" size="xs"></q-icon><q-tooltip>diagram editor</q-tooltip>
            </q-tab>
            <q-tab v-if="state.configuration.tabs?.animation_editor?.enabled" name="animation_editor"><q-icon name="fa-solid fa-person" size="xs"></q-icon><q-tooltip>animation editor</q-tooltip>
            </q-tab>

          </q-tabs>
          <q-tab-panels v-model="tab_right" style="background-color: black">
            <q-tab-panel v-if="state.configuration.tabs?.numerics?.enabled" name="numerics">
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
            <q-tab-panel v-if="state.configuration.tabs?.numerics_editor?.enabled" name="numerics_editor">
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
            <q-tab-panel v-if="state.configuration.tabs?.animation_editor?.enabled" name="animation_editor">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
              <AnimationEditor></AnimationEditor>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel v-if="state.configuration.tabs?.diagram_editor?.enabled" name="diagram_editor">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <DiagramEditorComponent></DiagramEditorComponent>
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
import { useModelStore } from 'src/stores/model';
import NumericsComponent from "src/components/NumericsComponent.vue";
import ModelEditor from "src/components/ModelEditorComponent.vue"
import VentilatorComponent from 'src/components/VentilatorComponent.vue';
import DiagramComponent from 'src/components/DiagramComponent.vue';
import NiceController from 'src/components/NiceController.vue';
import BigNumbersComponent from 'src/components/BigNumbersComponent.vue';
import DiagramEditorComponent from 'src/components/DiagramEditor.vue';
import TaskScheduler from 'src/components/TaskScheduler.vue';
import EclsControllerComponent from 'src/components/EclsControllerComponent.vue';
import AnimationComponent from 'src/components/AnimationComponent.vue';
import AnimationEditor from 'src/components/AnimationEditor.vue';
import ModelBuilderComponent from 'src/components/ModelBuilderComponent.vue';
import ControllerComponent from 'src/components/ControllerComponent.vue';
import DemoComponent from 'src/components/DemoComponent.vue';
import ScalerComponent from 'src/components/ScalerComponent.vue';
import NumericsEditor from 'src/components/NumericsEditor.vue';
import RealtimeChart from 'src/components/RealtimeChart.vue';
import LoopChart from 'src/components/LoopChart.vue';

export default defineComponent({
  name: 'MainPage',
  setup() {
    const state = useStateStore();
    const user = useUserStore();
    const modelStore = useModelStore();
    let monitor_redraw = 1;

    return {
      state,
      user,
      modelStore,
      monitor_redraw
    }
  },
  components: {
    NumericsComponent,
    BigNumbersComponent,
    ModelEditor,
    ModelBuilderComponent,
    VentilatorComponent,
    DiagramComponent,
    NiceController,
    DiagramEditorComponent,
    TaskScheduler,
    EclsControllerComponent,
    AnimationComponent,
    AnimationEditor,
    ControllerComponent,
    NumericsEditor,
    RealtimeChart,
    LoopChart,
    DemoComponent,
    ScalerComponent

  },
  data() {
    return {
      tab_left: "demo",
      tab_center: "diagram",
      tab_right: "numerics",
      chart_alive: true,
      ventilator_alive: true,
      ecls_alive:true,
      xy_alive: true,
      loop_alive: true,
      diagram_alive: true,
      screen_offset: 135.0,
      screen_height: 100.0
    }
  },
  methods: {
    applyDefaultTabs() {
      const defaults = this.state.configuration?.default_tabs
      if (!defaults) return
      if (defaults.left) this.tab_left = defaults.left
      if (defaults.center) this.tab_center = defaults.center
      if (defaults.right) this.tab_right = defaults.right
      this.tabCenterChanged(this.tab_center)
    },
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
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          break;
        case "ventilator":
          this.animation_alive = false
          this.ventilator_alive = true
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          break;
        case "ecls":
          this.animation_alive = false
          this.ecls_alive = true
          this.ventilator_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          break;
        case "time_chart":
          this.animation_alive = false
          this.ventilator_alive = false
          this.chart_alive = true
          this.xy_alive = false
          this.loop_alive = false
          this.diagram_alive = false
          break;
        case "xy_chart":
          this.animation_alive = false
          this.ventilator_alive = false
          this.chart_alive = false
          this.xy_alive = true
          this.loop_alive = false
          this.diagram_alive = false
          break;
        case "loop_chart":
          this.animation_alive = false
          this.ventilator_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.loop_alive = true
          this.diagram_alive = false
          break;
        case "diagram":
          this.animation_alive = false
          this.ventilator_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.loop_alive = false
          this.diagram_alive = true
          break;
        case "placenta":
          this.animation_alive = false
          this.ventilator_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.loop_alive = false
          this.diagram_alive = false
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
    this.$bus.off("reset", this.modelReady)
    this.$bus.off("redraw_monitors", this.redrawMonitors)
    this.$bus.off("sprite_tapped", this.onDiagramTap)
    if (this._unwatchReady) this._unwatchReady()
    if (this._unwatchDefaultTabs) this._unwatchDefaultTabs()
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
    this._unwatchReady = this.$watch(
      () => this.modelStore.isReady,
      (val) => { if (val) this.modelReady() }
    )

    // apply default tabs now if the configuration is already loaded, and on any future state load
    this.applyDefaultTabs()
    this._unwatchDefaultTabs = this.$watch(
      () => this.state.configuration?.default_tabs,
      () => this.applyDefaultTabs(),
      { deep: true }
    )

    // if the models resets make sure the watchlist is up to date
    this.$bus.on("reset", this.modelReady)

    // redraw monitors event
    this.$bus.on("redraw_monitors", this.redrawMonitors)

    // listen for sprite tap
    this.$bus.on("sprite_tapped", this.onDiagramTap)

  }
})
</script>

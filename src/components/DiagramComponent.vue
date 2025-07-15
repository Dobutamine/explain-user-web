<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="stage" :style="{ display: display }">
      <canvas id="stage">
      </canvas>
    </div>

    <div v-if="shuntOptionsVisible" class="row justify-center">
      <q-option-group v-model="selected_shunts" :options="shunt_options" color="primary" inline size="xs" dense
        class="text-overline" type="checkbox" @update:model-value="toggleShunts"></q-option-group>
    </div>
    <div class="row justify-center">
          <q-btn flat round dense size="sm" icon="fa-solid fa-download" color="white" class="q-ml-sm"
          @click="loadDiagram">
          <q-tooltip> get a diagram from the server </q-tooltip></q-btn>

        <q-btn flat round dense size="sm" icon="fa-solid fa-upload" color="white" class="q-mr-sm q-ml-sm"
          @click="saveDiagram">
          <q-tooltip> save diagram to the server </q-tooltip></q-btn>

        <q-btn v-if="stateDiagram" flat round dense size="sm" icon="fa-solid fa-star" color="white" class="q-ml-sm"
          @click="setDiagramAsStateDefault">
          <q-tooltip> current diagram is default state diagram </q-tooltip></q-btn>

        <q-btn v-if="!stateDiagram" flat round dense size="sm" icon="fa-regular fa-star" color="white" class="q-ml-sm"
          @click="setDiagramAsStateDefault">
          <q-tooltip> current diagram is not default state diagram </q-tooltip></q-btn>

    </div>

  </q-card>
</template>
<script>
import { explain } from "../boot/explain";
import { PIXI } from "../boot/pixi";
import { useStateStore } from "src/stores/state";
import { useDiagramStore } from "src/stores/diagram";
import { useGeneralStore } from "src/stores/general";
import { useUserStore } from "src/stores/user";

import Compartment from "./ui_elements/Compartment";
import Connector from "./ui_elements/Connector";
import Container from "./ui_elements/Container";
import Device from "./ui_elements/Device";
import Exchanger from "./ui_elements/Exchanger";
import Pump from "./ui_elements/Pump";
import Valve from "./ui_elements/Valve";


let canvas = null;
let pixiApp = null;
let skeletonGraphics = null;
let gridVertical = null;
let gridHorizontal = null;
let diagram_components = {};


export default {
  setup() {
    const state = useStateStore();
    const general = useGeneralStore();
    const user = useUserStore();
    const diagram = useDiagramStore();
    return { state, diagram, general, user };
  },
  props: {
    alive: Boolean,
  },
  data() {
    return {
      title: "ANIMATED DIAGRAM",
      collapsed: false,
      editingSelection: 1,
      display: "block",
      ticker: null,
      pixiApp: null,
      global_speed: 1,
      global_scale: 1,
      diagram: {},
      diagram_components: {},
      gridVertical: null,
      gridHorizontal: null,
      skeletonGraphics: null,
      shortTimer: null,
      rt_running: false,
      selected_shunts: [],
      shunt_options: [{
        label: 'PDA',
        value: 'DA',
        description: 'ductus arteriosus',
        models: ['DA']
      },
      {
        label: 'FO',
        value: 'FO',
        description: 'foramen ovale',
        models: ['FO']
      },
      {
        label: 'VSD',
        value: 'VSD',
        description: 'ventricular septal defect',
        models: ['VSD']
      },
      {
        label: 'IPS',
        value: 'IPS',
        description: 'intra-pulmonary shunt',
        models: ['IPS']
      },
      {
        label: 'LUNGS',
        value: 'LUNGS',
        description: 'lungs',
        models: ['LUNG', 'LUNGS', 'ALL', 'ALR', 'GASEX_LL', 'GASEX_RL']
      },
      {
        label: 'ECLS',
        value: 'ECLS',
        description: 'ecls',
        models: ['ECLS_TUBIN', 'ECLS_OXY', 'ECLS_PUMP', 'ECLS_TUBOUT', 'ECLS_DR', 'ECLS_TUBIN_PUMP', 'ECLS_PUMP_OXY', 'ECLS_OXY_TUBOUT', 'ECLS_RE']
      },
      {
        label: 'PLACENTA',
        value: 'PLACENTA',
        description: 'placenta',
        models: ['UMB_ART', 'UMB_VEN', 'PLF', 'AD_UMB_ART', 'UMB_ART_PLF','PLF_UMB_VEN','UMB_VEN_IVCI']
      }
      ],
      shuntOptionsVisible: true,
      stateDiagram: true

    };
  },
  methods: {
    setDiagramAsStateDefault() {
      this.state.diagram_definition.name = this.diagram.diagram_definition.settings.name
      this.stateDiagram = true;
      this.$bus.emit('upload_state')
    },
    loadDiagram(){
      this.$bus.emit('load_diagram_dialog');
    },
    saveDiagram() {
      this.$bus.emit('save_diagram_dialog');
    },
    toggleShunts() {
      this.shunt_options.forEach((shunt_option) => {
        this.showOrHideShunt(this.selected_shunts.includes(shunt_option.value), shunt_option.models)
      })
    },
    showOrHideShunt(state, shunts) {
      if (state) {
        // show the shunt if not already shown
        shunts.forEach(shunt => {
          const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
          if (index_sprite < 0) {
            // not shown already so add it
            this.addDiagramComponent(shunt)
          }
        })
      } else {
        // hide the shunt
        shunts.forEach(shunt => {
          const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
          if (index_sprite > 0) {
            // it is present so hide it
            this.removeDiagramComponent(shunt)
          }
        })
      }

    },
    async initDiagram() {
      // first clear all children from the stage
      if (pixiApp) {
        this.destroyPixiApp(pixiApp)
      }
      
      // get the reference to the canvas
      canvas = document.getElementById("stage");

      // set the resolution of the pix application
      PIXI.settings.RESOLUTION = 2;

      // define a pixi app with the canvas as view
      pixiApp = new PIXI.Application({
        powerPreference: 'high-performance',
        transparent: true,
        antialias: true,
        backgroundColor: 0x111111,
        view: canvas,
        eventMode: 'none',
        eventFeatures: {
          move: false,
          /** disables the global move events which can be very expensive in large scenes */
          globalMove: false,
          click: false,
          wheel: false,
        }
      });

      // allow sortable children
      pixiApp.stage.sortableChildren = true;

    },
    clearDiagram() {
      pixiApp.stage.removeChildren();
    },
    drawSkeletonGraphics() {
      if (isNaN(diagram_components.xOffset)) {
        diagram_components.xOffset = 0
      }
      if (isNaN(diagram_components.yOffset)) {
        diagram_components.yOffset = 0
      }
      if (isNaN(diagram_components.radius) || diagram_components.radius <= 0.01) {
        diagram_components.radius = 0.6
      }

      if (this.diagram.diagram_definition.settings.skeleton) {
        if (skeletonGraphics) {
          skeletonGraphics.clear();
          pixiApp.stage.removeChild(skeletonGraphics);
        }
        const radius = this.diagram.diagram_definition.settings.radius;
        const color = this.diagram.diagram_definition.settings.skeletonColor;

        // initalize the skeleton graphics
        skeletonGraphics = new PIXI.Graphics();

        // get center stage
        const xCenter = (pixiApp.renderer.width / 4) + this.diagram.diagram_definition.settings.xOffset
        const yCenter = (pixiApp.renderer.height / 4) + this.diagram.diagram_definition.settings.yOffset
        skeletonGraphics.zIndex = 0;
        skeletonGraphics.beginFill(color);
        skeletonGraphics.lineStyle(1, color, 1);
        skeletonGraphics.drawCircle(xCenter, yCenter, (xCenter - this.diagram.diagram_definition.settings.xOffset) * radius);
        skeletonGraphics.endFill();
        pixiApp.stage.addChild(skeletonGraphics);
      }
    },
    drawGrid() {
      if (this.diagram.diagram_definition.settings.grid) {
        if (isNaN(this.diagram.diagram_definition.settings.gridSize) || this.diagram.diagram_definition.settings.gridSize <= 5) {
          this.diagram.diagram_definition.settings.gridSize = 15
        }
        const gridSize = this.diagram.diagram_definition.settings.gridSize;

        if (gridVertical) {
          gridVertical.clear();
          pixiApp.stage.removeChild(gridVertical);
        }
        // build the grid
        gridVertical = new PIXI.Graphics();
        for (let x = 0; x < pixiApp.renderer.width; x = x + gridSize) {
          gridVertical.lineStyle(1, 0x888888, 0.1);
          gridVertical.moveTo(x, 0);
          gridVertical.lineTo(x, pixiApp.renderer.height);
        }
        pixiApp.stage.addChild(gridVertical);

        if (gridHorizontal) {
          gridHorizontal.clear();
          pixiApp.stage.removeChild(gridHorizontal);
        }
        gridHorizontal = new PIXI.Graphics();
        for (let y = 0; y < pixiApp.renderer.height; y = y + gridSize) {
          gridHorizontal.lineStyle(1, 0x888888, 0.1);
          gridHorizontal.moveTo(0, y);
          gridHorizontal.lineTo(pixiApp.renderer.width, y);
        }
        pixiApp.stage.addChild(gridHorizontal);
      } else {
        if (gridVertical) {
          gridVertical.clear();
          pixiApp.stage.removeChild(gridVertical);
        }
        if (gridHorizontal) {
          gridHorizontal.clear();
          pixiApp.stage.removeChild(gridHorizontal);
        }
      }
    },
    removeDiagramComponent(comp_name) {
      const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      if (index_sprite > 0) {
        pixiApp.stage.removeChild(pixiApp.stage.children[index_sprite])
      }

      const index_text = pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      if (index_text > 0) {
        pixiApp.stage.removeChild(pixiApp.stage.children[index_text])
      }

      const index_path = pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
      if (index_path > 0) {
        pixiApp.stage.removeChild(pixiApp.stage.children[index_path])
      }

      this.diagram.diagram_definition.components[comp_name].enabled = false
    },
    addDiagramComponent(comp_name) {
      const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      const index_text = pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      const index_path = pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
      if (index_sprite < 0 && index_text < 0 && index_path < 0) {
        let component = {}
        this.diagram.diagram_definition.components[comp_name].enabled = true
        component[comp_name] = this.diagram.diagram_definition.components[comp_name]
        this.drawComponents(component)
      }
    },
    update_component(comp_name) {
      // first remove diagram component from canvas and disable it in the list
      this.removeDiagramComponent(comp_name)

      // add diagram component
      this.addDiagramComponent(comp_name)

    },
    drawComponents(component_list) {
      // get the layout properties
      const xCenter = (pixiApp.renderer.width / 4)
      const yCenter = (pixiApp.renderer.height / 4)
      const xOffset = this.diagram.diagram_definition.settings.xOffset
      const yOffset = this.diagram.diagram_definition.settings.yOffset
      const radius = this.diagram.diagram_definition.settings.radius;
      let global_scaling = this.diagram.diagram_definition.settings.scaling * this.global_scale
      const max_to2 = this.diagram.diagram_definition.settings.max_to2;

      // first render all compartments and then the connectors and other types
      if (component_list == undefined) {
        return
      }
      Object.entries(component_list).forEach(([key, component]) => {
        if (component.enabled) {
          switch (component.type) {
            case "Compartment":
              diagram_components[key] = new Compartment(
                pixiApp,
                key,
                component.label,
                component.models,
                component.layout,
                xCenter,
                yCenter,
                xOffset,
                yOffset,
                radius,
                component.picto,
                global_scaling, 
                max_to2
              );
              let watched_models_comp = []
              component.models.forEach(m => {
                watched_models_comp.push(m + ".vol")
                watched_models_comp.push(m + ".pres")
                watched_models_comp.push(m + ".to2")
              })
              explain.watchModelProps(watched_models_comp)
              break;

            case "Pump":
              diagram_components[key] = new Pump(
                pixiApp,
                key,
                component.label,
                component.models,
                component.layout,
                xCenter,
                yCenter,
                xOffset,
                yOffset,
                radius,
                component.picto,
                global_scaling,
                max_to2
              );
              let watched_models_pump = []
              component.models.forEach(m => {
                watched_models_pump.push(m + ".vol")
                watched_models_pump.push(m + ".to2")
                watched_models_pump.push(m + ".pump_rpm")
              })
              explain.watchModelProps(watched_models_pump)
              break;
            

              diagram_components[key] = new BloodCompartment(
                pixiApp,
                key,
                component.label,
                component.models,
                component.layout,
                xCenter,
                yCenter,
                xOffset,
                yOffset,
                radius,
                component.compPicto,
                global_scaling,
                max_to2
              );
              let watched_models_bc = []
              component.models.forEach(m => {
                watched_models_bc.push(m + ".vol")
                watched_models_bc.push(m + ".to2")
              })
              explain.watchModelProps(watched_models_bc)
              break;
            
            case "Device":
              diagram_components[key] = new Device(
                pixiApp,
                key,
                component.label,
                component.models,
                component.layout,
                xCenter,
                yCenter,
                xOffset,
                yOffset,
                radius,
                component.picto,
                global_scaling,
                max_to2
              );
              break;
          }
        }
      });

      Object.entries(component_list).forEach(([key, component]) => {
        // inject the offsets
        if (component.enabled) {
          switch (component.type) {
            case "Container":
              diagram_components[key] = new Container(
                pixiApp,
                key,
                component.label,
                component.models,
                component.layout,
                xCenter,
                yCenter,
                xOffset,
                yOffset,
                radius,
                component.picto,
                global_scaling,
                max_to2
              );
              let watched_models_cont = []
              component.models.forEach(m => {
                watched_models_cont.push(m + ".vol")
              })
              explain.watchModelProps(watched_models_cont)
              break;

            case "Connector":
              diagram_components[key] = new Connector(
                pixiApp,
                key,
                component.label,
                component.models,
                diagram_components[component.dbcFrom],
                diagram_components[component.dbcTo],
                component.layout,
                component.picto,
                global_scaling,
                this.global_speed
              );
              let watched_models_con = []
              component.models.forEach(m => {
                watched_models_con.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_con)
              break;
          
            case "Valve":
              diagram_components[key] = new Valve(
                pixiApp,
                key,
                component.label,
                component.models,
                diagram_components[component.dbcFrom],
                diagram_components[component.dbcTo],
                component.layout,
                component.picto,
                global_scaling,
                this.global_speed
              );
              let watched_models_valve = []
              component.models.forEach(m => {
                watched_models_valve.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_valve)
              break;

            case "Exchanger":
              diagram_components[key] = new Exchanger(
                pixiApp,
                key,
                component.label,
                component.models,
                component.layout,
                xCenter,
                yCenter,
                xOffset,
                yOffset,
                radius,
                component.picto,
                global_scaling,
                max_to2
              );
              let watched_models_gasex = []
              component.models.forEach(m => {
                watched_models_gasex.push(m + ".flux_" + component.layout.general.animatedBy)
              })
              explain.watchModelProps(watched_models_gasex)
              break;
            }    
        }
      });
    },
    update_watchlist() {
      Object.entries(this.diagram.diagram_definition.components).forEach(([key, component]) => {
        // inject the offsets
        if (component.enabled) {
          switch (component.compType) {
            case "Pump":
              let watched_models_pump = []
              component.models.forEach(m => {
                watched_models_pump.push(m + ".vol")
                watched_models_pump.push(m + ".to2")
                watched_models_pump.push(m + ".pump_rpm")
              })
              explain.watchModelProps(watched_models_pump)
              break;
            case "Compartment":
              let watched_models_bc = []
              component.models.forEach(m => {
                watched_models_bc.push(m + ".vol")
                watched_models_bc.push(m + ".to2")
              })
              explain.watchModelProps(watched_models_bc)
              break;
            case "Device":
              break;
            case "Connector":
              let watched_models_con = []
              component.models.forEach(m => {
                watched_models_con.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_con)
              break;
            case "Valve":
              let watched_models_valve = []
              component.models.forEach(m => {
                watched_models_valve.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_valve)
              break;
            case "Container":
              let watched_models_cont = []
              component.models.forEach(m => {
                watched_models_cont.push(m + ".vol")
              })
              explain.watchModelProps(watched_models_cont)
              break;
            case "Exchanger":
              let watched_models_gasex = []
              component.models.forEach(m => {
                watched_models_gasex.push(m + ".flux_" + component.gas)
              })
              explain.watchModelProps(watched_models_gasex)
              break;
          }
        }
      });

    },
    processStateChanged() {
      if (!this.rt_running) {
        if (this.alive) {
          Object.values(diagram_components).forEach((sprite) => {
            if (explain.modelData.length > 0) {
              sprite.update(explain.modelData[explain.modelData.length - 1]);
            }
          });
        }
      }

    },
    tickerFunction() {
      if (this.rt_running && this.alive) {
        Object.values(diagram_components).forEach((sprite) => {
          if (explain.modelData.length > 0) {
            sprite.update(explain.modelData[0]);
          }
        });
      }
    },
    buildDiagram() {
      // read the general diagram settings
      if (isNaN(this.diagram.diagram_definition.settings.speed) || this.diagram.diagram_definition.settings.speed <= 0.01) {
        this.diagram.diagram_definition.settings.speed = 1
      }

      if (isNaN(this.diagram.diagram_definition.settings.scaling) || this.diagram.diagram_definition.settings.scaling <= 0.01) {
        this.diagram.diagram_definition.settings.scaling = 1
      }
      this.global_speed = this.diagram.diagram_definition.settings.speed
      this.global_scale = this.diagram.diagram_definition.settings.scaling

      pixiApp.stage.removeChildren();

      // draw the skeleton graphics
      this.drawSkeletonGraphics()

      // draw the grid
      this.drawGrid()

      // draw the components
      diagram_components = {}
      this.drawComponents(this.diagram.diagram_definition.components)

      // remove the event listeners
      pixiApp.stage.children.forEach((child) => {
        child.eventMode = "none";
      })

      // first remove the old ticker
      if (this.ticker) {
        pixiApp.ticker.remove(this.tickerFunction)
      }
      // add the new ticker function and start it
      this.ticker = pixiApp.ticker.add(this.tickerFunction);

      // get the shunt options state of the diagram
      this.shuntOptionsVisible = this.diagram.diagram_definition.settings.shuntOptionsVisible

      // get the current shunts state
      this.selected_shunts = []
      if (this.shuntOptionsVisible) {
        try {
          if (this.diagram.diagram_definition.components['DA'].enabled) {
            this.selected_shunts.push('DA')
          }
        } catch {}
        try {
          if (this.diagram.diagram_definition.components['FO'].enabled) {
            this.selected_shunts.push('FO')
          }
        } catch {}
        
        try {
          if (this.diagram.diagram_definition.components['IPS'].enabled) {
            this.selected_shunts.push('IPS')
          }
        } catch {}

        try {
          if (this.diagram.diagram_definition.components['VSD'].enabled) {
            this.selected_shunts.push('VSD')
          }
        } catch {}

        try {
          if (this.diagram.diagram_definition.components['ECLS'].enabled) {
            this.selected_shunts.push('ECLS')
          }
        } catch {}

        try {
          if (this.diagram.diagram_definition.components['LUNG'].enabled) {
            this.selected_shunts.push('LUNGS')
          }
        } catch {}

        try {
          if (this.diagram.diagram_definition.components['PLF'].enabled) {
            this.selected_shunts.push('PLACENTA')
          }
        } catch {}

      }

      // check whether diagram is default state diagram
      if (this.state.diagram_definition.name == this.diagram.diagram_definition.settings.name) {
        this.stateDiagram = true;
      } else {
        this.stateDiagram = false;
      }

    },
    changeEclsMode(mode) {

    },
    async loadModelDefinition() {
      let result = await this.diagram.getDiagramFromServer(this.general.apiUrl, this.user.name, this.state.diagram_definition.name, this.user.token)
    }
  },
  beforeUnmount() { 
    this.$bus.off("state", this.processStateChanged)
    this.$bus.off('rt_start', () => this.rt_running = true)
    this.$bus.off('rt_stop', () => this.rt_running = false)
    this.$bus.off('reset', () => this.buildDiagram())
    this.$bus.off('rebuild_diagram', () => this.buildDiagram())
    this.$bus.off("update_watchlist", () => this.update_watchlist())
    this.$bus.off("update_drainage_site", (new_site) => {
      try {
        this.diagram.diagram_definition.components['ECLS_DR'].dbcFrom = new_site
        this.update_component('ECLS_DR')
      } catch { }
    })
    this.$bus.off("update_return_site", (new_site) => {
      try {
        this.diagram.diagram_definition.components['ECLS_RE'].dbcTo = new_site
        this.update_component('ECLS_RE')
      } catch { }
    })
    this.$bus.off("ecls_state_changed", (state) => { 
      if (state) {
        this.selected_shunts.push('ECLS')
        this.selected_shunts = [...new Set(this.selected_shunts)];
        this.toggleShunts()
      } else {
        this.selected_shunts.filter(item => item !== 'ECLS');
        this.toggleShunts()
      }
    })
    this.$bus.off("placenta_state_changed", (state) => { 
      if (state) {
        this.selected_shunts.push('PLACENTA')
        this.selected_shunts = [...new Set(this.selected_shunts)];
        this.toggleShunts()
      } else {
        this.selected_shunts = this.selected_shunts.filter(item => item !== 'PLACENTA');
        this.toggleShunts()
      }
    })
    this.$bus.off("ecls_mode_change", (mode) => this.changeEclsMode(mode))
  },
  mounted() {
    // initialize and build the diagram
    this.initDiagram().then(() => {
      // load the diagram from the server
      this.loadModelDefinition().then (() => {
        console.log(`Diagram ${this.diagram.diagram_definition.settings.name} loaded.`)
        this.buildDiagram()
      })
    })

    // add the event listener for the state change
    this.$bus.on("state", this.processStateChanged)

    // add the event listener for the diagram update
    this.$bus.on('rt_start', () => this.rt_running = true)
    this.$bus.on('rt_stop', () => this.rt_running = false)

    this.$bus.on('reset', () => this.buildDiagram())
    this.$bus.on('rebuild_diagram', () => this.buildDiagram())

    this.$bus.on("update_watchlist", () => this.update_watchlist())

    this.$bus.on("update_drainage_site", (new_site) => {
      try {
        this.diagram.diagram_definition.components['ECLS_DR'].dbcFrom = new_site
        this.update_component('ECLS_DR')
      } catch { }
    })

    this.$bus.on("update_return_site", (new_site) => {
      try {
        this.diagram.diagram_definition.components['ECLS_RE'].dbcTo = new_site
        this.update_component('ECLS_RE')
      } catch { }
    })

    this.$bus.on("ecls_state_changed", (state) => { 
      if (state) {
        this.selected_shunts.push('ECLS')
        this.selected_shunts = [...new Set(this.selected_shunts)];
        this.toggleShunts()
      } else {
        this.selected_shunts = this.selected_shunts.filter(item => item !== 'ECLS');
        this.toggleShunts()
      }
    })

    this.$bus.on("placenta_state_changed", (state) => { 
      if (state) {
        this.selected_shunts.push('PLACENTA')
        this.selected_shunts = [...new Set(this.selected_shunts)];
        this.toggleShunts()
      } else {
        this.selected_shunts = this.selected_shunts.filter(item => item !== 'PLACENTA');
        this.toggleShunts()
      }
    })
    
    this.$bus.on("ecls_mode_change", (mode) => this.changeEclsMode(mode))
  },
};

</script>
<style scoped>
#stage {
  width: 100%;
}
</style>

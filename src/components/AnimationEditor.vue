<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>
    <div v-if="!collapsed">
      <div class="q-ml-md q-mr-sm q-mb-sm  text-overline justify-center">
        <div class="text-center text-secondary" @click="generalSettingsCollapsed = !generalSettingsCollapsed">general settings</div>
        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row justify-center">
          <q-toggle class="col-3" v-model="state.diagram_definition.settings.grid" label="grid" dense dark size="sm"
            @update:model-value="updateDiagram" />
          <q-input v-if="state.diagram_definition.settings.grid" class="q-ml-sm col-3" v-model.number="state.diagram_definition.settings.gridSize" type="number" :min="5"
            :max="100" :step="1" label="grid size" dense dark @update:model-value="updateDiagram" />
          <q-toggle class="q-ml-sm col-3" v-model="state.diagram_definition.settings.skeleton" label="skeleton" dense dark size="sm"
            @update:model-value="updateDiagram" />
        </div>

        <div v-if="state.diagram_definition.settings.skeleton && !generalSettingsCollapsed" class="q-ma-sm row">
          <q-input class="col" v-model.number="state.diagram_definition.settings.xOffset" label="x-offset"
            type="number" :min="-1000" :max="1000" :step="1" dense dark @update:model-value="updateDiagram" />
          <q-input class="q-ml-sm col" v-model.number="state.diagram_definition.settings.yOffset" label="y-offset"
            type="number" :min="-1000" :max="1000" :step="1" dense dark @update:model-value="updateDiagram" />
          <q-input class="q-ml-sm col" v-model.number="state.diagram_definition.settings.radius" label="radius" dense dark
            type="number" :min="0.01" :max="1" :step="0.01" @update:model-value="updateDiagram" />
        </div>

        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row">
          <q-input class="col" v-model.number="state.diagram_definition.settings.scaling" label="scaling" dense dark
            type="number" :min="0.1" :max="1000" :step="0.1" @update:model-value="updateDiagram" />
          <q-input class="q-ml-sm col" v-model.number="state.diagram_definition.settings.speed" label="speed" dense dark
            type="number" :min="0.1" :max="1000" :step="0.1" @update:model-value="updateDiagram" />
        </div>

        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row">
          <q-toggle v-model="state.diagram_definition.settings.shuntOptionsVisible" label="shunt and ecls options" dense
            dark size="sm" @update:model-value="updateDiagram" />
        </div>

        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row justify-center">
          <q-btn class="col q-ma-sm" color="negative" size="sm" @click="clearDiagram">CLEAR DIAGRAM</q-btn>
          <q-btn v-if="this.state.prev_diagram_definition" class="col q-ma-sm" color="secondary" size="sm"
            @click="restore_diagram">RESTORE DIAGRAM</q-btn>
        </div>

      </div>

      <div class="text-center text-overline text-secondary" @click="componentSettingsCollapsed = !componentSettingsCollapsed">component
        settings</div>
      <div v-if="!componentSettingsCollapsed" class="q-ml-md q-mr-sm q-mb-sm row text-overline justify-center">
        <q-select v-if="diagramComponentNames != undefined" class="col-9" v-model:model-value="selectedDiagramComponentName"
          :options="diagramComponentNames" label="diagram component" dense
          @update:model-value="editComponent"></q-select>
        <q-btn color="secondary" label="ADD NEW" dark class="q-ma-sm q-mt-md col" dense size="sm">
          <q-menu dark>
            <q-list dense>
              <div v-for="(
                  diagramComponentType, index
                ) in diagramComponentTypes" :key="index">
                <q-item clickable dense>
                  <q-item-section clickable v-close-popup @click="addComponent(diagramComponentType)">
                    {{ diagramComponentType }}
                  </q-item-section>
                </q-item>
              </div>
            </q-list>
          </q-menu>
        </q-btn>
      </div>


      <div v-if="!componentSettingsCollapsed">
        <!-- editor mode 1 or 2  (new or edit mode)-->
        <div v-if="editorMode == 1 || editorMode == 2"
          class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md row text-overline justify-center">
          {{ compType }}
          <div :style="{ 'font-size': '10px', width: '100%' }">
            
            <!-- General settings -->
            <q-toggle label="enabled" v-model="compEnabled" dense size="sm" style="width: 100%" />
            <q-input label="name" v-model="compName" square hide-hint dense dark stack-label style="width: 100%" />
            <q-input label="label" v-model="compLabel" square hide-hint dense dark stack-label style="width: 100%" />

            <!-- Compartment/Pump/Container/Exchanger -->
            <div v-if="
              ( compType == 'Compartment' ||
                compType == 'Pump' ||
                compType == 'Container' ||
                compType == 'Exchanger')
            " style="width: 100%">
              <div class="row">
                <q-select class="col" label="models" v-model="compModelSelection" 
                  :options="compModels" hide-bottom-space dense multiple style="font-size: 12px" />
              </div>
              <div class="row">
                <q-select class="col" label="pictogram" square hide-hint stack-label v-model="compPicto"
                  :options="pictos" hide-bottom-space dense dark style="font-size: 12px" />   
              </div>
              <div v-if="compType != 'Container'" class="row">
                  <div class="q-mt-xs">animation settings</div>
              </div>
              <div v-if="compType != 'Container' && compType != 'Exchanger'" class="row">
                <q-btn-toggle class="col q-mr-sm" v-model="compAnimatedBy" size="sm" dark spread dense no-caps
                  toggle-color="blue-grey-6" color="grey-9" text-color="black" :options="[
                    { label: 'NONE', value: 'none' },
                    { label: 'VOLUME', value: 'vol' },
                    { label: 'PRESSURE', value: 'pers' },
                ]" />
              </div>
              <div v-if="compType == 'Exchanger'" class="row">
                <q-btn-toggle class="col q-mr-sm" v-model="compAnimatedBy" size="sm" dark spread dense no-caps
                  toggle-color="blue-grey-6" color="grey-9" text-color="black" :options="[
                    { label: 'O2', value: 'o2' },
                    { label: 'CO2', value: 'co2' }
                ]" />
              </div>


              <!-- general layout settings--> 
              <div class="row">
                  <div class="q-mt-xs">general layout settings</div>
              </div>
              <div class="row">
                  <q-input class="col q-mr-sm" label="z-index" v-model="compZIndex" square type="number" hide-hint dense
                    dark stack-label />
                 <q-input class="col q-mr-sm" label="alpha" v-model="compAlpha" square type="number" hide-hint dense
                  dark stack-label />
                   <q-checkbox v-if="compType != 'Container' && compType != 'Exchanger'" class="col q-ma-sm" label="to2 color" v-model="compTinting" dense size="xs" />
              </div>

              <!-- sprite settings--> 

              <div class="row">
                  <div class="q-mt-xs">image layout settings</div>
              </div>
              <!-- sprite position settings--> 
              <q-btn-toggle class="col q-mr-sm" v-model="compSpritePosType" size="sm" dark spread dense no-caps
                toggle-color="blue-grey-6" color="grey-9" text-color="black" :options="[
                  { label: 'ARC', value: 'arc' },
                  { label: 'RELATIVE', value: 'rel' },
                ]" />
              <div v-if="compSpritePosType == 'rel'" class="row">
                <q-input class="col q-mr-sm" label="postion x" v-model="compSpritePosX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="position Y" v-model="compSpritePosY" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <div v-if="compSpritePosType == 'arc'" class="row">
                <q-input class="col q-mr-sm" label="position Degrees" v-model="compSpritePosDgs" square type="number"
                  hide-hint dense dark stack-label />
              </div>
              <!-- sprite scale settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="scale X" v-model="compSpriteScaleX" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-mr-sm" label="scale Y" v-model="compSpriteScaleY" square type="number" hide-hint dense
                  dark stack-label />
              </div>
              <!-- sprite anchor settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="anchor X" v-model="compSpriteAnchorX" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-mr-sm" label="anchor Y" v-model="compSpriteAnchorY" square type="number" hide-hint dense
                  dark stack-label />
              </div>
              <!-- sprite rotation settings--> 
              <div v-if="compType != 'Exchanger'" class="row">
                <q-input class="col q-mr-sm" label="rotation" v-model="compSpriteRotation" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- sprite color settings--> 
              <div v-if="!compTinting" class="row">
                <q-input v-model="compSpriteColor" dense label="image color mask" class="col q-mr-sm q-mb-sm">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="compSpriteColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

               <!-- label settings--> 

              <div v-if="compLabel != ''" class="row">
                  <div class="q-mt-xs">text label layout settings</div>
              </div>
               <!-- label position offset settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input class="col q-mr-sm" label="label x" v-model="compLabelPosX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="label y" v-model="compLabelPosY" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- label size and rotation settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input class="col q-mr-sm" label="label size" v-model="compLabelSize" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="label rotation" v-model="compLabelRotation" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- label color settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input v-model="compLabelColor" dense label="label color" class="col q-mr-sm q-mt-sm q-mb-sm">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="compLabelColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Connector/Valve -->
            <div v-if="
              compType == 'Connector' ||
              compType == 'Valve'
            ">
              <div class="row">
                <q-select class="col" label="models" v-model="compModelSelection" 
                  :options="compModels" hide-bottom-space dense multiple style="font-size: 12px" />
              </div>
              <div class="row">
                <q-select class="col" label="Diagram comp from" v-model="compDbcFrom" :options="compDbcFroms"
                  hide-bottom-space dense style="font-size: 12px" />
                <q-select class="col" label="Diagram comp To" v-model="compDbcTo" :options="compDbcTos"
                  hide-bottom-space dense style="font-size: 12px" />
              </div>
              <div class="row">
                <q-select class="col" label="pictogram" square hide-hint stack-label v-model="compPicto"
                  :options="pictos" hide-bottom-space dense dark style="font-size: 12px" />   
              </div>

               <!-- general layout settings--> 
              <div class="row">
                  <div class="q-mt-xs">general layout settings</div>
              </div>
              <div class="row">
                  <q-input class="col q-mr-sm" label="z-index" v-model="compZIndex" square type="number" hide-hint dense
                    dark stack-label />
                 <q-input class="col q-mr-sm" label="alpha" v-model="compAlpha" square type="number" hide-hint dense
                  dark stack-label />
                   <q-checkbox class="col q-ma-sm" label="to2 color" v-model="compTinting" dense size="xs" />
              </div>

              <!-- path layout settings-->
               <div class="row">
                  <div class="q-mt-xs">path layout settings</div>
              </div>
              <div class="row">
                <q-btn-toggle class="col q-mr-sm" v-model="compPathType" size="sm" dark spread dense no-caps
                toggle-color="blue-grey-6" color="grey-9" text-color="black" :options="[
                  { label: 'ARC', value: 'arc' },
                  { label: 'ARC_R', value: 'arc_r' },
                  { label: 'STRAIGHT', value: 'straight' },
                ]" />
              </div>
              <div class="row">
                  <q-input class="col q-mr-sm" label="path width" v-model="compPathWidth" square type="number" hide-hint dense
                    dark stack-label />
              </div>
              <div class="row">
                <q-input v-model="compPathColor" dense label="path color" class="col q-mr-sm q-mt-sm q-mb-sm">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="compPathColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- path sprite settings-->

              <div class="row">
                  <div class="q-mt-xs">path sprite settings</div>
              </div>
              <!-- sprite position settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="postion x" v-model="compSpritePosX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="position Y" v-model="compSpritePosY" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- sprite scale settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="scale X" v-model="compSpriteScaleX" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-mr-sm" label="scale Y" v-model="compSpriteScaleY" square type="number" hide-hint dense
                  dark stack-label />
              </div>
              <!-- sprite anchor settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="anchor X" v-model="compSpriteAnchorX" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-mr-sm" label="anchor Y" v-model="compSpriteAnchorY" square type="number" hide-hint dense
                  dark stack-label />
              </div>
              <!-- sprite rotation settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="rotation" v-model="compSpriteRotation" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- sprite color settings--> 
              <div v-if="!compTinting" class="row">
                <q-input v-model="compSpriteColor" dense label="image color mask" class="col q-mr-sm q-mb-sm">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="compSpriteColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

               <!-- path label settings--> 
              <div v-if="compLabel != ''" class="row">
                  <div class="q-mt-xs">path text label settings</div>
              </div>
               <!-- label position offset settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input class="col q-mr-sm" label="label x" v-model="compLabelPosX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="label y" v-model="compLabelPosY" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- label size and rotation settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input class="col q-mr-sm" label="label size" v-model="compLabelSize" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="label rotation" v-model="compLabelRotation" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- label color settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input v-model="compLabelColor" dense label="label color" class="col q-mr-sm q-mt-sm q-mb-sm">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="compLabelColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Device -->
            <div v-if="compType == 'Device'">
              <div class="row">
                <q-select class="col" label="pictogram" square hide-hint stack-label v-model="compPicto"
                  :options="pictos" hide-bottom-space dense dark style="font-size: 12px" />   
              </div>

               <!-- general layout settings--> 
              <div class="row">
                  <div class="q-mt-xs">general layout settings</div>
              </div>
              <div class="row">
                  <q-input class="col q-mr-sm" label="z-index" v-model="compZIndex" square type="number" hide-hint dense
                    dark stack-label />
                 <q-input class="col q-mr-sm" label="alpha" v-model="compAlpha" square type="number" hide-hint dense
                  dark stack-label />
              </div>

              <!-- sprite settings--> 

              <div class="row">
                  <div class="q-mt-xs">image layout settings</div>
              </div>
              <!-- sprite position settings--> 
              <q-btn-toggle class="col q-mr-sm" v-model="compSpritePosType" size="sm" dark spread dense no-caps
                toggle-color="blue-grey-6" color="grey-9" text-color="black" :options="[
                  { label: 'ARC', value: 'arc' },
                  { label: 'RELATIVE', value: 'rel' },
                ]" />
              <div v-if="compSpritePosType == 'rel'" class="row">
                <q-input class="col q-mr-sm" label="postion x" v-model="compSpritePosX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="position Y" v-model="compSpritePosY" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <div v-if="compSpritePosType == 'arc'" class="row">
                <q-input class="col q-mr-sm" label="position Degrees" v-model="compSpritePosDgs" square type="number"
                  hide-hint dense dark stack-label />
              </div>
              <!-- sprite scale settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="scale X" v-model="compSpriteScaleX" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-mr-sm" label="scale Y" v-model="compSpriteScaleY" square type="number" hide-hint dense
                  dark stack-label />
              </div>
              <!-- sprite anchor settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="anchor X" v-model="compSpriteAnchorX" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-mr-sm" label="anchor Y" v-model="compSpriteAnchorY" square type="number" hide-hint dense
                  dark stack-label />
              </div>
              <!-- sprite rotation settings--> 
              <div class="row">
                <q-input class="col q-mr-sm" label="rotation" v-model="compSpriteRotation" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- sprite color settings--> 
              <div class="row">
                <q-input v-model="compSpriteColor" dense label="image color mask" class="col q-mr-sm q-mb-sm">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="compSpriteColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

               <!-- label settings--> 
              <div v-if="compLabel != ''" class="row">
                  <div class="q-mt-xs">text label settings</div>
              </div>
               <!-- label position offset settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input class="col q-mr-sm" label="label x" v-model="compLabelPosX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="label y" v-model="compLabelPosY" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- label size and rotation settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input class="col q-mr-sm" label="label size" v-model="compLabelSize" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-mr-sm" label="label rotation" v-model="compLabelRotation" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <!-- label color settings--> 
              <div v-if="compLabel != ''" class="row">
                <q-input v-model="compLabelColor" dense label="label color" class="col q-mr-sm q-mt-sm q-mb-sm">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="compLabelColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </div>

        <!-- editor mode 3 (removal mode)-->
        <div v-if="editorMode === 3">
          <div class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
            Are you sure you want to remove {{ compName }}?
          </div>
          <div class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
            <q-btn color="red-10" dense size="sm" style="width: 50px" icon="fa-solid fa-trash-can"
              @click="deleteComponentFromStore"></q-btn>
            <q-btn color="grey-14" size="xs" dense style="width: 50px" @click="cancelDiagramBuild"
              icon="fa-solid fa-refresh"></q-btn>
          </div>
        </div>

        <!-- status message -->
        <div class="q-gutter-sm row text-overline justify-center q-mb-xs" style="font-size: 10px">
          {{ statusMessage }}
        </div>

        <!-- server communication buttons -->
        <div v-if="editorMode < 3 && editorMode > 0"
          class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
          <q-btn color="secondary" dense size="sm" style="width: 50px" icon="fa-solid fa-check"
            @click="saveDiagramComponent"></q-btn>
          <q-btn color="negative" dense size="sm" style="width: 50px" icon="fa-solid fa-trash-can"
            @click="deleteComponent">
          </q-btn>
          <q-btn color="grey-14" size="xs" dense style="width: 50px" @click="cancelDiagramBuild"
            icon="fa-solid fa-xmark"></q-btn>
        </div>


      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";
import { useUserStore } from "src/stores/user";
import { useStateStore } from "src/stores/state";
import { useGeneralStore } from "src/stores/general";

export default {
  components: {},
  setup() {
    const user = useUserStore();
    const state = useStateStore();
    const general = useGeneralStore();
    return {
      user,
      state,
      general,
    };
  },
  data() {
    return {
      selectedDiagramComponentName: "",
      editorMode: 0,
      title: "DIAGRAM EDITOR",
      generalSettingsCollapsed: true,
      componentSettingsCollapsed: false,
      collapsed: false,
      modelTypes: [],
      selectedDiagramComponent: "",
      diagramComponentTypes: [
        "Compartment",
        "Connector",
        "Container",
        "Device", 
        "Exchanger", 
        "Pump", 
        "Valve"
      ],
      diagramComponentNames: [],
      pictos: [
        "arrow.png",
        "container.png",
        "exchanger.png",
        "gas_container.png",
        "general.png",
        "lung.png",
        "placenta.png",
        "premature-baby-CPAP.png",
        "pump.png",
        "term-baby-ventilator.png",
        "thoracic_cage.png",
        "trachea.png",
        "ventilator.png",
        "vessel.png"
      ],
      rebuild_event: null,
      statusMessage: "",
      // state variables
      compName: "",
      compType: "",
      compLabel: "",
      compPicto: "",
      compEnabled: true,
      compModels: [],
      compModelSelection: [],
      compDbcFroms: [],
      compDbcTos: [],
      compDbcFrom: "",
      compDbcTo: "",
      compAnimatedBy: "none",
      compZIndex: 10,
      compAlpha: 1,
      compTinting: true,
      compSpriteColor: "#ffffff",
      compSpritePosType: "rel",
      compSpritePosX: 0,
      compSpritePosY: 0,
      compSpritePosDgs: 0,
      compSpriteScaleX: 1,
      compSpriteScaleY: 1,
      compSpriteAnchorX: 0.5,
      compSpriteAnchorY: 0.5,
      compSpriteRotation: 0,
      compLabelPosX: 0,
      compLabelPosY: 0,
      compLabelSize: 12,
      compLabelRotation: 0,
      compLabelColor: "#ffffff",
      compPathType: "straight",
      compPathWidth: 5,
      compPathColor: "#666666"
    };
  },
  methods: {
    restore_diagram() {
      if (this.state.prev_diagram_definition) {
        this.state.diagram_definition = JSON.parse(JSON.stringify(this.prev_diagram_definition));
        this.$bus.emit("rebuild_diagram");
      }
    },
    clearDiagram() {
      this.prev_diagram_definition = JSON.parse(JSON.stringify(this.state.diagram_definition));
      this.state.diagram_definition.components = {};
      this.$bus.emit("rebuild_diagram");
    },
    updateDiagram() {
      this.$bus.emit("rebuild_diagram");
    },
    getAllDiagramComponents() {
      let diagram_component_names = [];
      if (this.state.diagram_definition.components) {
        Object.keys(this.state.diagram_definition.components).forEach((component) => {
          diagram_component_names.push(component);
        });
      }
      diagram_component_names.sort();
      return diagram_component_names;
    },
    saveDiagramComponent() {
      // build the component settings
      if (this.state.diagram_definition.components == undefined) {
        this.state.diagram_definition.components = {}
      }

      this.state.diagram_definition.components[this.compName] = {
        type: this.compType,
        label: this.compLabel,
        picto: this.compPicto,
        enabled: this.compEnabled,
        models: this.compModelSelection,
        dbcFrom: this.compDbcFrom,
        dbcTo: this.compDbcTo,
        layout: {
          general: {
            animatedBy: this.compAnimatedBy,
            z_index: parseInt(this.compZIndex),
            alpha: parseInt(this.compAlpha),
            tinting: this.compTinting
          },
          path: {
            type: this.compPathType,
            width: this.compPathWidth,
            color: this.compPathColor,
          },
          sprite: {
            color: this.compSpriteColor,
            pos: {
              type: this.compSpritePosType,
              x: parseFloat(this.compSpritePosX),
              y: parseFloat(this.compSpritePosY),
              dgs: parseFloat(this.compSpritePosDgs),
            },
            scale: {
              x: parseFloat(this.compSpriteScaleX),
              y: parseFloat(this.compSpriteScaleY),
            },
            anchor: {
              x: parseFloat(this.compSpriteAnchorX),
              y: parseFloat(this.compSpriteAnchorY),
            },
            rotation: parseFloat(this.compSpriteRotation),
          },
          label: {
            pos_x: parseFloat(this.compLabelPosX),
            pos_y: parseFloat(this.compLabelPosY),
            size: parseInt(this.compLabelSize),
            rotation: parseFloat(this.compLabelRotation),
            color: this.compLabelColor,
          }
        }
      };

      // rebuild the diagram
      this.statusMessage = "component added to the component list"
      setTimeout(() => { this.statusMessage = ""}, 2000)
      this.$bus.emit("rebuild_diagram");
    },
    cancelDiagramBuild() {
      // clear all fields
      this.clearFields();
      // get the diagram component list
      this.diagramComponentNames = this.getAllDiagramComponents();
      // reset the select comp type
      this.compType = "";
      // reset the select diagram component
      this.selectedDiagramComponentName = "";
      // set the editot mode to selection mode
      this.editorMode = 0;
    },
    deleteComponent() {
      this.editorMode = 3;
      this.compName = this.selectedDiagramComponentName;
    },
    deleteComponentFromStore() {
      // also delete all connector which are pointing to this component
      let compToDelete = [];
      compToDelete.push(this.compName);

      let compType = this.state.diagram_definition.components[this.compName].compType;
      if (
        compType === "Compartment" ||
        compType === "Device" ||
        compType === "Pump"
      ) {
        Object.entries(this.state.diagram_definition.components).forEach(
          ([component_name, component]) => {
            if (
              component.compType === "Connector" ||
              component.compType === "Valve"
            ) {
              if (
                component.dbcFrom === this.compName ||
                component.dbcTo === this.compName
              ) {
                compToDelete.push(component_name);
              }
            }
          }
        );
      }
      compToDelete.forEach((c) => {
        try {
          delete this.state.diagram_definition.components[c];
        } catch {}
        
      });

      //delete this.state.diagram_definition.components[this.compName];
      this.$bus.emit("rebuild_diagram");
      this.cancelDiagramBuild();
    },
    addComponent(compType) {
      // set the editor mode to adding
      this.editorMode = 1;

      // clear all the fields
      this.clearFields();

      // start preparing the form 
      this.compEnabled = true;

      // find the explain model types which can by selected depending on the component type
      this.compModels = this.selectModelTypeToAdd(compType);
      
      // reset the component mode selection
      this.compModelSelection = [];

      // component type specific default settings
      switch (compType) {
        case "Compartment":
          this.compPicto = "container.png"
          this.compSpritePosType = "arc"
          this.compLabelSize = 10;
          this.compAnimatedBy = "vol"
          break;
        case "Connector":
          this.compDbcFroms = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compDbcTos = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compAnimatedBy = "flow"
          this.compPicto = "container.png"
          this.compPathType = "arc"
          this.compSpriteScaleX = 1.0;
          this.compSpriteScaleY = 2.0;
          this.compPathWidth = 7.0;
          this.compZIndex = 8.0;
          break;
        case "Valve":
          this.compDbcFroms = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compDbcTos = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compAnimatedBy = "flow"
          this.compPicto = "arrow.png"
          this.compSpriteScaleX = 1.0;
          this.compSpriteScaleY = 2.0;
          break;
        case "Container":
          this.compDbcFroms = this.findDiagramComponents(["Compartment", "Pump", "Container", "Device"]);
          this.compDbcTos = this.findDiagramComponents(["Compartment", "Pump", "Container", "Device"]);
          this.compPicto = "container.png"
          this.compAnimatedBy = "vol"
          this.compTinting = false;
          break;
        case "Device":
          this.compPicto = "general.png"
          this.compAnimatedBy = "none"
          break;
        case "Pump":
          this.compDbcFroms = this.findDiagramComponents(["Connector", "Valve"]);
          this.compDbcTos = this.findDiagramComponents(["Connector", "Valve"]);
          this.compPicto = "pump.png"
          this.compAnimatedBy = "vol"
          break;
        case "Exchanger":
          this.compPicto = "exchanger.png"
          this.compAnimatedBy = "o2"
          break;
      }
    },
    editComponent() {
      // set the editor mode to editing
      this.editorMode = 2;

      // clear all the fields
      this.clearFields();

      // get all the properties of the selected diagram component
      this.selectedDiagramComponent = this.state.diagram_definition.components[this.selectedDiagramComponentName];

      // get the component type
      this.compType = this.selectedDiagramComponent.type

      // find the explain model types which can by selected depending on the component type
      this.compModels = this.selectModelTypeToAdd(this.compType);
      
      // reset the component mode selection
      this.compModelSelection = [];

      // get the dbc comp froms and tos dependending on the component type
      switch (this.compType) {
        case "Connector":
          this.compDbcFroms = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compDbcTos = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compDbcFrom = this.selectedDiagramComponent.dbcFrom;
          this.compDbcTo = this.selectedDiagramComponent.dbcTo;
          break;
        case "Valve":
          this.compDbcFroms = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compDbcTos = this.findDiagramComponents(["Compartment", "Pump"]);
          this.compDbcFrom = this.selectedDiagramComponent.dbcFrom;
          this.compDbcTo = this.selectedDiagramComponent.dbcTo;
          break;
        case "Container":
          this.compDbcFroms = this.findDiagramComponents(["Compartment", "Pump", "Container", "Device"]);
          this.compDbcTos = this.findDiagramComponents(["Compartment", "Pump", "Container", "Device"]);
          this.compAnimatedBy = "vol"
          this.compTinting = false
          break;
        case "Device":
          this.compAnimatedBy = "none"
          this.compTinting = false
          break;
        case "Exchanger":
          this.compAnimatedBy = "o2"
          this.compTinting = false
          break;
        case "Pump":
          this.compDbcFroms = this.findDiagramComponents(["Connector", "Valve"]);
          this.compDbcTos = this.findDiagramComponents(["Connector", "Valve"]);
          this.compDbcFrom = this.selectedDiagramComponent.dbcFrom;
          this.compDbcTo = this.selectedDiagramComponent.dbcTo;
          break;
      }
      
      // now process all the selected daigram component settings
      this.compName = this.selectedDiagramComponentName;
      this.compLabel = this.selectedDiagramComponent.label;
      this.compPicto = this.selectedDiagramComponent.picto;
      this.compEnabled = this.selectedDiagramComponent.enabled;
      this.compModelSelection = this.selectedDiagramComponent.models;

      this.compAnimatedBy = this.selectedDiagramComponent.layout.general.animatedBy;
      this.compZIndex = this.selectedDiagramComponent.layout.general.z_index;
      this.compAlpha = this.selectedDiagramComponent.layout.general.alpha;
      this.compTinting = this.selectedDiagramComponent.layout.general.tinting;

      this.compPathType = this.selectedDiagramComponent.layout.path.type;
      this.compPathWidth = this.selectedDiagramComponent.layout.path.width;
      this.compPathColor = this.selectedDiagramComponent.layout.path.color;

      this.compSpriteColor = this.selectedDiagramComponent.layout.sprite.color;
      this.compSpritePosType = this.selectedDiagramComponent.layout.sprite.pos.type;
      this.compSpritePosX = this.selectedDiagramComponent.layout.sprite.pos.x;
      this.compSpritePosY = this.selectedDiagramComponent.layout.sprite.pos.y;
      this.compSpritePosDgs = this.selectedDiagramComponent.layout.sprite.pos.dgs;
      this.compSpriteScaleX = this.selectedDiagramComponent.layout.sprite.scale.x; 
      this.compSpriteScaleY = this.selectedDiagramComponent.layout.sprite.scale.y; 
      this.compSpriteAnchorX = this.selectedDiagramComponent.layout.sprite.anchor.x; 
      this.compSpriteAnchorY = this.selectedDiagramComponent.layout.sprite.anchor.y; 
      this.compSpriteRotation = this.selectedDiagramComponent.layout.sprite.rotation;

      this.compLabelPosX = this.selectedDiagramComponent.layout.label.pos_x;
      this.compLabelPosY = this.selectedDiagramComponent.layout.label.pos_y;
      this.compLabelSize = this.selectedDiagramComponent.layout.label.size;
      this.compLabelRotation = this.selectedDiagramComponent.layout.label.rotation;
      this.compLabelColor = this.selectedDiagramComponent.layout.label.color;
    },
    clearFields() {
      this.compName = "";
      this.compType = "";
      this.compLabel = "";
      this.compPicto = "";
      this.compDbcFrom = "";
      this.compDbcTo = "";
      this.compEnabled = true;
      this.compModels = [];
      this.compModelSelection = [];
      this.compAnimatedBy = "none";
      this.compZIndex = 10;
      this.compAlpha = 1;
      this.compTinting = true;
      this.compSpriteColor = "#ffffff";
      this.compSpritePosType = "rel";
      this.compSpritePosX = 0;
      this.compSpritePosY = 0;
      this.compSpritePosDgs = 0;
      this.compSpriteScaleX = 1;
      this.compSpriteScaleY = 1;
      this.compSpriteAnchorX = 0.5;
      this.compSpriteAnchorY = 0.5;
      this.compSpriteRotation = 0;
      this.compLabelPosX = 0;
      this.compLabelPosY = 0;
      this.compLabelSize = 10;
      this.compLabelRotation = 0;
      this.compLabelColor = "#ffffff";
      this.compPathType = "straight";
      this.compPathWidth = 5;
      this.compPathColor = "#666666"
    },
    findDiagramComponents(compTypes) {
      if (this.state.diagram_definition.components == undefined) return

      let component_list = []
      Object.keys(this.state.diagram_definition.components).forEach((compName) => {
        if (compTypes.includes(this.state.diagram_definition.components[compName].type)) {
          component_list.push(compName)
        }
      });

      component_list.sort();

      return component_list;
    },
    selectModelTypeToAdd(compType) {
      this.compType = compType;
      // find all models which this compType could hold
      let models = [];
      let model_list = []
      switch (this.compType) {
        case "Compartment":
          // define the general compartment graphic
          this.compPicto = "container.png";
          // list of the possible explain models this Compartment can hold
          models = [
            "Capacitance", 
            "TimeVaryingElastance", 
            "BloodCapacitance", 
            "BloodPump", 
            "BloodTimeVaryingElastance",  
            "BloodVessel",
            "HeartChamber", 
            "MicroVascularUnit",
            "GasCapacitance"
          ];
          break;
        case "Connector":
          // define the general compartment graphic
          this.compPicto = "container.png";
          // list of the possible explain models this Compartment can hold
          models = [
            "Resistor",
            "Valve"
          ];
          break;
        case "Pump":
          // define the general compartment graphic
          this.compPicto = "container.png";
          // list of the possible explain models this Compartment can hold
          models = ["BloodPump"];
          break;
        case "Container":
          this.compPicto = "container.png";
          models = ["Container"];
          break;
        case "Exchanger":
          this.compPicto = "container.png";
          models = ["GasExchanger", "BloodDiffusor", "GasDiffusor"];
          break;
        case "Device":
          this.compPicto = "container.png";
          models = [];
          break;
      }
      Object.keys(explain.modelState.models).forEach((model) => {
        if (models.includes(explain.modelState.models[model].model_type)) {
          model_list.push(model);
        }
      });
      model_list.sort();

      return model_list;
    }
  },
  beforeUnmount() {
    // remove the model state event listener
    document.removeEventListener(
      "edit_comp",
      (e) => {
        this.editComponent(e.detail);
      },
      false
    );
  },
  mounted() {
    this.rebuild_event = new CustomEvent("rebuild_diagram");

    try {
      document.removeEventListener(
        "edit_comp",
        (e) => {
          this.editComponent(e.detail);
        },
        false
      );
    } catch { }

    // get the model state
    explain.getModelState();

    // get all diagram component names
    this.diagramComponentNames = this.getAllDiagramComponents();

    document.addEventListener(
      "edit_comp",
      (e) => {
        this.editComponent(e.detail);
      },
      false
    );

    this.$bus.on("diagram_loaded", () => this.diagramComponentNames = this.getAllDiagramComponents());

    this.$bus.on("addNewModelToDiagram", (new_element) => {
      this.addToDiagramFromOutside(new_element);
    });
  },
};
</script>

<style></style>

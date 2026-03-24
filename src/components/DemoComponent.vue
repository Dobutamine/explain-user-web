<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>

    <div v-if="!collapsed" class="q-pa-sm">
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div v-for="(section, index_main) in demoDropdownSections" :key="index_main" class="col-12">
                <q-btn-dropdown class="text-overline" style="width: 100%;" color="black" :label="section.label" no-caps align="left">
                    <q-list>
                        <div v-for="(demoItem, index_case) in section.items" :key="index_case">
                            <q-item clickable v-close-popup @click="loadDemoState(demoItem)">
                                <q-item-section>{{ demoItem.label }}</q-item-section>
                            </q-item>
                        </div>
                    </q-list>
                </q-btn-dropdown>
                <div v-if="section.label === 'Cardiovascular'" class="q-mt-xs q-ml-sm text-caption case-publication-note">
                    <a href="https://pubmed.ncbi.nlm.nih.gov/37322544/" target="_blank" rel="noopener noreferrer">
                        * published <u>here</u>
                    </a>
                </div>
            </div>
        </div>  



    </div>
  </q-card>
</template>

<script>
import { useGeneralStore } from "src/stores/general";
import { useUserStore } from "src/stores/user";
import { useStateStore } from 'src/stores/state';
import { useDiagramStore } from 'src/stores/diagram';
import { explain } from 'src/boot/explain';

export default {
  name: "DemoComponent",
  setup() {
    const user = useUserStore();
    const general = useGeneralStore();
    const state = useStateStore();
        const diagram = useDiagramStore();

    return {
      user,
      general,
      state,
            diagram,
    };
  },
  data() {
    return {
        title: "BUILT-IN PATIENT CASES",
        collapsed: false,
    };
  },
    computed: {
        demoDropdownSections() {
            const demo = this.state?.configuration?.demo;

            if (!demo || typeof demo !== "object" || Array.isArray(demo)) {
                return [];
            }

            return Object.entries(demo)
                .map(([sectionKey, sectionValue]) => {
                    const entries = Array.isArray(sectionValue)
                        ? sectionValue
                        : sectionValue && typeof sectionValue === "object"
                            ? [sectionValue]
                            : [];

                    const itemKeys = entries.flatMap((entry) => {
                        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
                            return [];
                        }

                        return Object.entries(entry).map(([label, fileName]) => ({
                            label,
                            fileName,
                        }));
                    });

                    return {
                        label: sectionKey,
                        items: itemKeys,
                    };
                })
                .filter((section) => section.items.length > 0);
        },
    },
  methods: {
        async loadDemoState(demoItem) {
            const fileName = typeof demoItem?.fileName === "string" ? demoItem.fileName.trim() : "";

            if (!fileName) {
                return;
            }

            const loaded = await this.state.getSharedStateFromServer(
                this.general.apiUrl,
                this.user.name,
                fileName,
                this.user.token
            );

            if (!loaded) {
                this.$q.notify({
                    color: "negative",
                    textColor: "white",
                    message: `Could not load demo state: ${fileName}`,
                });
                return;
            }

            explain.build(this.state.model_definition);
            this.state.default = this.state.name === this.user.defaultState;

            if (this.state?.diagram_definition?.name) {
                const diagramLoaded = await this.diagram.getSharedDiagramFromServer(
                    this.general.apiUrl,
                    this.state.diagram_definition.name,
                    this.user.token
                );

                if (diagramLoaded) {
                    this.$bus.emit("rebuild_diagram");
                }
            }

            this.$bus.emit("reset");
        },

  },
  mounted() {

  },
};
</script>

<style>
.case-publication-note {
    color: #9e9e9e;
}

.case-publication-note a {
    color: inherit;
}
</style>
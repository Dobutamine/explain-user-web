<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>

    <div v-if="!collapsed" class="q-pa-sm">
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div class="col">
                <q-btn-dropdown style="width: 100%;" color="black" label="Part I: Cardiovascular system" size="md" no-caps align="left">
                    <q-list>
                        <div v-for="(mi, index_main) in circ_cases_names" :key="index_main">
                            <q-item clickable v-close-popup>
                                <q-item-section>{{ mi }}</q-item-section>
                            </q-item>
                        </div>
                    </q-list>
                </q-btn-dropdown>
                <div class="q-mt-xs q-ml-sm text-caption case-publication-note">
                    <a href="https://pubmed.ncbi.nlm.nih.gov/37322544/" target="_blank" rel="noopener noreferrer">
                        * in this published article
                    </a>
                </div>
            </div>
        </div>  
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div class="col">
                <q-btn-dropdown style="width: 100%;" color="black" label="Part II: Respiratory system" size="md" no-caps align="left">
                    <q-list>
                        <div v-for="(mi, index_main) in resp_cases_names" :key="index_main">
                            <q-item clickable v-close-popup>
                                <q-item-section>{{ mi }}</q-item-section>
                            </q-item>
                        </div>
                    </q-list>
                </q-btn-dropdown>
                <div class="q-mt-xs q-ml-sm text-caption case-publication-note">
                    <a href="https://pubmed.ncbi.nlm.nih.gov/37322544/" target="_blank" rel="noopener noreferrer">
                        * in this published article
                    </a>
                </div>
            </div>
        </div> 
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div class="col">
                <q-btn-dropdown style="width: 100%;" color="black" label="Part III: Extracorporeal Life Support" size="md" no-caps align="left">
                    <q-list>
                        <div v-for="(mi, index_main) in resp_cases_names" :key="index_main">
                            <q-item clickable v-close-popup>
                                <q-item-section>{{ mi }}</q-item-section>
                            </q-item>
                        </div>
                    </q-list>
                </q-btn-dropdown>
                <div class="q-mt-xs q-ml-sm text-caption case-publication-note">
                    not published yet
                </div>
            </div>
        </div> 
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div class="col">
                <q-btn-dropdown style="width: 100%;" color="black" label="Part IV: Placenta and artifical whomb" size="md" no-caps align="left">
                    <q-list>
                        <div v-for="(mi, index_main) in resp_cases_names" :key="index_main">
                            <q-item clickable v-close-popup>
                                <q-item-section>{{ mi }}</q-item-section>
                            </q-item>
                        </div>
                    </q-list>
                </q-btn-dropdown>
                <div class="q-mt-xs q-ml-sm text-caption case-publication-note">
                    not published yet
                </div>
            </div>
        </div> 
    </div>
  </q-card>
</template>

<script>
import { useGeneralStore } from "src/stores/general";
import { useUserStore } from "src/stores/user";

export default {
  name: "DemoComponent",
  setup() {
    const user = useUserStore();
    const general = useGeneralStore();

    return {
      user,
      general,
    };
  },
  data() {
    return {
        title: "BUILT-IN PATIENT CASES",
        collapsed: false,
        circ_cases_names: [ 
            "normal neonate *", 
            "ductus arteriosus restricted *", 
            "ductus arteriosus unrestricted *",
            "acute pulmonary hypertension * ",
            "hypoplastic left heart syndrome", 
            "hypoplastic right heart syndrome", 
            "tricuspid atresia", 
            "tetralogy of fallot", 
            "transposition of the great arteries", 
            "total anomalous pulmonary venous return"
        ],
        resp_cases_names: [ 
            "normal neonate", 
            "meconium aspiration syndrome", 
            "congenital diaphragmatic hernia", 
            "pneumothorax", 
        ]
    };
  },
  methods: {

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
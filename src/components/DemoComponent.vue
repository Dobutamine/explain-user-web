<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>

    <div v-if="!collapsed" class="q-pa-sm">
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div class="col ">
                <q-btn-dropdown class="text-overline" style="width: 100%;" color="black" label="Cardiovascular" no-caps align="left">
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
                        * published <u>here</u>
                    </a>
                </div>
            </div>
        </div>  
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div class="col">
                <q-btn-dropdown class="text-overline" style="width: 100%;" color="black" label="Respiratory" no-caps align="left">
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
                        * published <u>here</u>
                    </a>
                </div>
            </div>
        </div> 
        <div class="row q-col-gutter-sm items-end q-mb-sm">
            <div class="col">
                <q-btn-dropdown class="text-overline" style="width: 100%;" color="black" label="ECMO and Perinatal Life Support"  no-caps align="left">
                    <q-list>
                        <div v-for="(mi, index_main) in ecls_cases_names" :key="index_main">
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
                <q-btn-dropdown class="text-overline" style="width: 100%;" color="black" label="Fetal and placental" no-caps align="left">
                    <q-list>
                        <div v-for="(mi, index_main) in placenta_cases_names" :key="index_main">
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
                <q-btn-dropdown class="text-overline" style="width: 100%;" color="black" label="Miscellaneous"  no-caps align="left">
                    <q-list>
                        <div v-for="(mi, index_main) in miscellaneous_cases_names" :key="index_main">
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
            "ductus arteriosus restricted flow *", 
            "ductus arteriosus unrestricted flow *",
            "ductus arteriosus bidirectional flow *",
            "acute pulmonary hypertension with RtL shunting *",
            "coarctation of the aorta",
            "tetralogy of fallot",
            "hypoplastic left heart syndrome",
            "transposition of the great arteries",
            "total anomalous pulmonary venous connection"
        ],
        resp_cases_names: [ 
            "normal neonate *",
            "meconium aspiration syndrome *",
            "congenital diaphragmatic hernia *",
        ],
        ecls_cases_names: [ 
            "meconium aspiration syndrome on VV-ECMO *", 
            "congenital diaphragmatic hernia on VA-ECMO *",
            "premature fetus on perinatal life support *"
        ],
        placenta_cases_names: [ 
            "normal term fetus *",
        ],
        miscellaneous_cases_names: [ 
        ],

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
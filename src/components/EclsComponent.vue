<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
      <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
        {{ title }}
      </div>

      <div v-if="isEnabled && ecls_running" class="row justify-center">
        <div class="q-ma-sm q-gutter-xs row items-center">
            <q-input v-model="blood_flow" label-color="white" hide-hint readonly filled dense stack-label label="Flow"
              style="max-width: 90px; font-size: 16px" squared />
            <q-input v-model="p_ven" label-color="red" hide-hint filled readonly dense stack-label label="P ven"
              style="max-width: 90px; font-size: 16px" squared />
            <q-input v-model="p_int" label-color="cyan" hide-hint filled readonly dense stack-label label="P int"
              style="max-width: 90px; font-size: 16px" squared />
            <q-input v-model="p_art" label-color="green" hide-hint filled readonly dense stack-label label="P art"
              style="max-width: 90px; font-size: 16px" squared />
            <q-input v-model="p_tmp" color="blue" hide-hint filled readonly dense stack-label label="P tmp"
              style="max-width: 90px; font-size: 16px" squared />
            <q-input v-model="svo2" color="blue" hide-hint filled readonly dense stack-label label="SvO2 (%)"
              style="max-width: 90px; font-size: 16px" squared />
        </div>
      </div>
  
  
      <!-- chart -->
      <div>
        <div v-if="isEnabled" class="q-mt-sm row text-overline justify-center"> {{  chart_title }}</div>
        <Line v-if="isEnabled" ref="myEclsChart" id="my-chart-ecls" :options="chartOptions"
          :data="chartData" style="max-height: 250px;" />
      </div>
      
  
      <div v-if="isEnabled" class="q-mt-sm text-overline justify-center q-gutter-xs row">
        <div>
          <q-toggle class="q-ml-sm q-pb-lg q-mr-sm" v-model="this.ecls_running" left-label dense size="xs"
            @update:model-value="toggleEcls">
            <q-icon name="fa-solid fa-power-off" size="xs"></q-icon>
            <q-tooltip>ECLS on/off</q-tooltip>
          </q-toggle>
        </div>
        <div>
          <q-toggle class="q-ml-sm q-pb-lg q-mr-sm" v-model="clamped" left-label dense size="xs"
            @update:model-value="set_clamp">
            <q-icon name="fa-solid fa-road-lock" size="xs"></q-icon>
            <q-tooltip>clamp circuit</q-tooltip>
          </q-toggle>
        </div>
        <div>
          <q-toggle v-model="pump_occlusive" class="q-ml-sm q-pb-lg q-mr-sm" left-label dense size="xs" @update:model-value="set_pump_occlusive">
            <q-icon name="fa-solid fa-arrow-down-up-lock" size="xs"></q-icon>
            <q-tooltip>occlusive pump?</q-tooltip></q-toggle>
        </div>
        <div>
          <q-select v-model="ecls_mode" label="ecls mode" :options="ecls_mode_options"
            @update:model-value="set_ecls_mode" color="blue" hide-hint filled dense stack-label
            style="width: 110px; font-size: 12px" class="q-mb-sm" squared>
            </q-select>
        </div>

        <div>
          <q-select v-model="drainage_origin" label="drainage" :options="cannulation_sites"
            @update:model-value="set_drainage_origin" color="blue" hide-hint filled dense stack-label
            style="width: 100px; font-size: 12px" class="q-mb-sm" squared>
            <q-tooltip>site where the blood is drained from</q-tooltip>
            </q-select>
        </div>
        <div>
          <q-select v-model="return_target" label="return" :options="cannulation_sites"
            @update:model-value="set_return_target" color="blue" hide-hint filled dense stack-label
            style="width: 100px; font-size: 12px" class="q-mb-sm" squared>
            <q-tooltip>site where the blood is returned to</q-tooltip>
            </q-select>
        </div>
        <!-- <div>
          <q-toggle v-model="advanced" class="q-ml-xs q-pb-lg q-mr-md" left-label dense size="xs">
            <q-icon name="fa-solid fa-ellipsis" size="xs"></q-icon>
            <q-tooltip>advanced parameters</q-tooltip></q-toggle>
        </div> -->

        <div v-if="ecls_running">
          <q-toggle v-model="graph_control" class="q-ml-sm" left-label dense size="sm"><q-icon name="fa-solid fa-chart-simple" size="xs"></q-icon><q-tooltip>chart options</q-tooltip></q-toggle>
        </div>

  
      </div>
      <!-- ecmo controls -->
      <div v-if="isEnabled && ecls_running && graph_control" class="text-overline justify-center q-gutter-sm row">
        <div>
          <q-toggle v-model="autoscale" left-label label="autoscaling" dense size="sm"
            @update:model-value="autoscaling" />
        </div>
        <div>
          <q-input v-if="!autoscale"
            v-model.number="y_min" type="number" left-label label="y-min" min="-1000" max="1000" step="0.1" filled dense hide-bottom-space
            @update:model-value="autoscaling" />
        </div>
        <div>
          <q-input v-if="!autoscale"
            v-model.number="y_max" type="number" left-label label="y-max" min="-1000" max="1000" step="0.1" filled dense hide-bottom-space
            @update:model-value="autoscaling" />
        </div>
        <div>
          <q-toggle v-model="state.configuration.chart_hires" left-label label="hi-res" dense size="sm"
            @update:model-value="toggleHires" />
        </div>
        <div>
          <q-input v-if="!state.configuration.chart_hires"
            v-model.number="rtWindow" type="number" left-label label="time" filled dense min="1" max="30" hide-bottom-space
            @update:model-value="updateRtWindow" />
        </div>
        </div>
  
      <div v-if="isEnabled && ecls_running" class="text-overline justify-center q-gutter-sm row">
        <div  class="q-mr-sm text-center">
          <div>pump</div>
          <q-knob show-value font-size="12px" v-model="pump_rpm" size="60px" :min="0" :max="5000" :step="1"
            :thickness="0.22" color="teal" track-color="grey-3" class="col"
            @update:model-value="set_pump_speed">
            {{ pump_rpm }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">rpm</div>
        </div>
        <div v-if="ecls_mode.includes('ECMO') || ecls_mode =='WHOMB'" class="q-mr-sm text-center">
          <div class="knob-label">gas flow</div>
          <q-knob show-value font-size="12px" v-model="sweep_gas" size="60px" :thickness="0.22" :min="0" :max="5" :step="0.1"
            color="teal" track-color="grey-3" class="col" @update:model-value="set_sweep_gas">
            {{ sweep_gas }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">l/min</div>
        </div>
        <div v-if="ecls_mode.includes('ECMO') || ecls_mode =='WHOMB'" class="q-mr-sm text-center">
          <div class="knob-label">fio2</div>
          <q-knob show-value font-size="12px" v-model="fio2" size="60px" :thickness="0.22" :min="21" :max="100" :step="1"
            color="teal" track-color="grey-3" class="col" @update:model-value="set_fio2">
            {{ fio2 }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">%</div>
        </div>
        <div v-if="ecls_mode.includes('ECMO') || ecls_mode =='WHOMB'" class="q-mr-sm text-center">
          <div class="knob-label">co2 flow</div>
          <q-knob show-value font-size="12px" v-model="co2_gas_flow" size="60px" :thickness="0.22" :min="0" :max="100" :step="1"
            color="teal" track-color="grey-3" class="col" @update:model-value="set_co2_flow">
            {{ co2_gas_flow }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">ml/min</div>
        </div>
      </div>

  
      <div v-if="isEnabled && advanced" class="q-mt-md q-mb-md text-overline justify-center q-gutter-xs row">
        <q-input v-model="tubing_diameter" @update:model-value="set_tubing_diameter" color="blue" hide-hint filled
          label="tubing diameter (mm)" :min="0.25" :max="0.5" :step="0.125" dense stack-label type="number"
          style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>
        </q-input>
        <q-input v-model="tubing_length" @update:model-value="set_tubing_length" color="blue" hide-hint filled
          label="tubing length (m)" :min="0.5" :max="5" :step="0.1" dense stack-label type="number"
          style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>
        </q-input>
        <q-input v-if="ecls_mode.includes('ECMO') || ecls_mode =='WHOMB'" v-model="oxy_volume" @update:model-value="set_oxy_volume" color="blue" hide-hint filled label="oxy vol (l)"
          :min="0" :max="60" :step="0.1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
          class="q-mr-sm text-center" squared>
        </q-input>
        <q-input v-model="pump_volume" @update:model-value="set_pump_volume" color="blue" hide-hint filled label="pump vol (l)"
          :min="0" :max="100" :step="1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
          class="q-mr-sm text-center" squared>
        </q-input>
      </div>
    </q-card>
  </template>
  
  <script>
  import { useStateStore } from "src/stores/state";
  import { explain } from "../boot/explain";
  import { Bar, Line, Scatter } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
  import { shallowRef } from 'vue'
  import * as Stat from "simple-statistics";
  import XYChartComponent from "./XYChartComponent.vue";
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)
  export default {
    setup() {
      const state = useStateStore()
  
      // make the chartdata reactive
      let chartData = shallowRef({
        labels: [],
        backgroundColor: '#888888',
        datasets: [{
          data: [],
          borderColor: 'rgb(192, 0, 0)',
          borderWidth: 2,
          pointStyle: false
        },
        {
          data: [],
          borderColor: 'rgb(0, 192, 0, 1.0)',
          borderWidth: 2,
          pointStyle: false
        }, {
          data: [],
          borderColor: 'rgb(0, 192, 192, 1.0)',
          borderWidth: 2,
          pointStyle: false
        }]
      })
  
      let chartOptions = shallowRef({
        responsive: true,
        animation: false,
        spanGaps: true,
        showLine: true,
        plugins: {
          legend: {
            display: false
          }
        },
        datasets: {
          line: {
            pointRadius: 0 // disable for all `'line'` datasets
          }
        },
        scales: {
          x: {
            display: false,
            grid: {
              color: '#444444'
            },
            border: {
              display: false
            }
          },
          y: {
            grid: {
              color: '#333333'
            },
            min: -50,
            max: 120,
            border: {
              display: false
            }
          }
        }
      })
  
      return {
        state,
        chartData,
        chartOptions
      }
  
    },
    props: {
      alive: Boolean
    },
    components: {
      Bar,
      Line,
      Scatter,
      XYChartComponent
    },
    data() {
      return {
        ecls_running: false,
        presetsEnabled: true,
        showPresets: false,
        show_summary: false,
        rtWindow: 3,
        rtWindowValidated: 3,
        analysisEnabled: true,
        autoscaleEnabled: false,
        autoscale: false,
        loopMode: false,
        isEnabled: true,
        pump_rpm: 1500.0,
        fio2: 21,
        co2_gas_flow: 0.0,
        sweep_gas: 1.0,
        temp: 37.0,
        humidity: 100,
        clamped: false,
        mode: "OFF",
        tubing_diameter: 0.25,
        tubing_length: 2,
        oxy_volume: 0.03,
        pump_volume: 0.342,
        x_min: 2,
        x_max: 15.0,
        y_min: -0.2,
        y_max: 1,
        multipliersEnabled: true,
        scaling: false,
        chart_title: "pressure (mmHg)",
        chart1_factor: 1.0,
        chart2_factor: 1.0,
        chart3_factor: 1.0,
        exportEnabled: true,
        title: "EXTRACORPOREAL LIFE SUPPORT",
        selectedModel1: "Ecls",
        selectedProp1: "p_ven",
        p1: "Ecls.p_ven",
        p2: "Ecls.p_int",
        p3: "Ecls.p_art",
        p1_max: 0.0,
        p1_min: 0.0,
        p1_sd: 0.0,
        p1_mean: 0.0,
        p1_permin: 0.0,
        p1_perbeat: 0.0,
        seconds: 0,
        x_axis: [],
        y1_axis: [],
        y2_axis: [],
        y3_axis: [],
        redrawInterval: 0.015,
        redrawTimer: 0.0,
        debug_mode: true,
        presets: {},
        update_model: true,
        curve_param: "pres",
        graph_control: false,
        advanced: false,
        blood_flow: 0.0,
        pre_oxy_so2: 0.0,
        post_oxy_so2: 0.0,
        p_int: 0.0,
        p_ven: 0.0,
        p_art: 0.0,
        p_tmp: 0.0,
        svo2: 0.0,
        drainage_origin: "RA",
        return_target: "AAR",
        ecls_mode: "ECMO",
        pump_occlusive: false,
        cannulation_sites: [],
        cannulation_model_options: ["HeartChamber", "BloodVessel"],
        ecls_mode_options: ["VA-ECMO", "VV-ECMO"] // ["VA-ECMO", "VV-ECMO", "LVAD", "RVAD", "BIVAD", "WHOMB"]
      };
    },
    methods: {
      set_tubing_diameter() {},
      set_tubing_length() {},
      set_ecls_mode() {
        switch (this.ecls_mode) {
          case "VA-ECMO":
            this.drainage_origin = "RA"
            this.set_drainage_origin()
            this.return_target = "AAR"
            this.set_return_target()
            break;
          case "VV-ECMO":
          this.drainage_origin = "RA"
            this.set_drainage_origin()
            this.return_target = "RA"
            this.set_return_target()
            break;
          case "LVAD":
            this.drainage_origin = "LV"
            this.set_drainage_origin()
            this.return_target = "AA"
            this.set_return_target()
            break;
          case "RVAD":
            this.drainage_origin = "RV"
            this.set_drainage_origin()
            this.return_target = "PA"
            this.set_return_target()
            break;
          case "BIVAD":
            this.drainage_origin = "LV"
            this.set_drainage_origin()
            this.return_target = "AA"
            this.set_return_target()
            break;
          case "WHOMB":
            this.drainage_origin = "UMB_ART"
            this.set_drainage_origin()
            this.return_target = "UMB_VEN"
            this.set_return_target()
            break;
        }
        explain.callModelFunction("Ecls.set_ecls_mode", [this.ecls_mode])
        this.$bus.emit("ecls_mode_change", this.ecls_mode)
      },
      set_drainage_origin() {
        explain.callModelFunction("Ecls.set_drainage_origin", [this.drainage_origin])
        this.$bus.emit("update_drainage_site", this.drainage_origin)
      },
      set_return_target() {
        explain.callModelFunction("Ecls.set_return_target", [this.return_target])
        this.$bus.emit("update_return_site", this.return_target)
      },
      set_pump_occlusive() {
        explain.callModelFunction("Ecls.set_pump_occlusive", [this.pump_occlusive])
      },
      set_oxy_volume() {
        explain.callModelFunction("Ecls.set_oxy_volume", [this.oxy_volume])
      },
      set_pump_volume() {
        explain.callModelFunction("Ecls.set_pump_volume", [this.pump_volume])
      },
      toggleHires() {
        if (this.state.configuration.chart_hires) {
          this.rtWindow = 1.0
          explain.setSampleInterval(0.0015)
        } else {
          this.rtWindow = 3.0
          explain.setSampleInterval(0.005)
        }
      },
      toggleEcls() {
        explain.callModelFunction("Ecls.switch_ecls", [this.ecls_running])
        if (this.ecls_running) {
          explain.watchModelProps([
                "Ecls.blood_flow",
                "Ecls.p_ven", 
                "Ecls.p_int", 
                "Ecls.p_art", 
                ])
          explain.watchModelPropsSlow([
                "Ecls.pre_oxy_so2",
                "Ecls.p_tmp"
                ])
        }
        this.$bus.emit("ecls_state_changed", this.ecls_running)
      },
      set_pump_speed() {
        if (this.update_model) {
          explain.callModelFunction("Ecls.set_pump_rpm", [parseFloat(this.pump_rpm)])
        }
      },
      set_fio2() {
        if (this.update_model) {
          explain.callModelFunction("Ecls.set_fio2", [parseFloat(this.fio2)])
        }
      },
      set_co2_flow() {
        if (this.update_model) {
          explain.callModelFunction("Ecls.set_co2_flow", [parseFloat(this.co2_gas_flow)])
        }
      },
      set_sweep_gas() {
        if (this.update_model) {
          explain.callModelFunction("Ecls.set_gas_flow", [parseFloat(this.sweep_gas)])
        }
      },
      set_clamp() {
        if (this.update_model) {
          explain.callModelFunction("Ecls.set_clamp", [this.clamped])
        }
      },
      update_() {
        explain.callModelFunction("Ventilator.set_ventilator_v", [this._map_cmh2o, this._freq, this._amplitude_cmh2o, this._bias_flow])
      },
      update_ecls_settings() {
        if (this.update_model) {
  
          switch (this.mode) {
            case "VA":
              if (!this.ecls_running) {
                this.ecls_running = true;
              }
              if (this.ecls_running) {
                //explain.callModelFunction("Ventilator.set_pc", [this.pump_rpm, this.peep_cmh2o, this.freq, this.insp_time, this.insp_flow])
              }
              break;
            case "VV":
              if (!this.ecls_running) {
                this.ecls_running = true;
              }
              if (this.ecls_running) {
                //explain.callModelFunction("Ventilator.set_prvc", [this.pump_rpm, this.peep_cmh2o, this.freq, this.tidal_volume, this.insp_time, this.insp_flow])
              }
              break;
          }
        }
      },
      clearProps() {
        this.p1 = "Ecls.p_ven"
        this.selectedModel1 = "Ecls"
        this.selectedProp1 = "p_ven"
      },
      toggleFactors() {
        if (!this.scaling) {
          this.chart1_factor = 1.0
        }
      },
      updateRtWindow() {
        if (this.rtWindow < 1.0) {
          this.rtWindow = 1.0
        }
        if (this.rtWindow > 10.0) {
          this.rtWindow = 10.0
        }
  
        this.rtWindowValidated = this.rtWindow
  
      },
      resetAnalysis() {
        this.p1_max = 0.0
        this.p1_min = 0.0
        this.p1_sd = 0.0
        this.p1_mean = 0.0
        this.p1_permin = 0.0
        this.p1_perbeat = 0.0
      },
      analyzeDataRt() {
        if (this.p1 !== '') {
          this.p1_max = Stat.max(this.y1_axis).toFixed(4)
          this.p1_min = Stat.min(this.y1_axis).toFixed(4)
          this.p1_sd = Stat.standardDeviation(this.y1_axis).toFixed(4)
          this.p1_mean = Stat.mean(this.y1_axis).toFixed(4)
          this.p1_permin = Stat.sum(this.y1_axis).toFixed(4)
          this.p1_perbeat = 0.0
        }
  
      },
      analyzeData() {
  
        this.resetAnalysis()
  
        let param1 = []
  
  
        if (this.p1 !== '') {
          param1 = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
          this.p1_max = Stat.max(param1).toFixed(4)
          this.p1_min = Stat.min(param1).toFixed(4)
          this.p1_sd = Stat.standardDeviation(param1).toFixed(4)
          this.p1_mean = Stat.mean(param1).toFixed(4)
          this.p1_permin = Stat.sum(param1).toFixed(4)
          this.p1_perbeat = 0.0
        }
  
      },
      autoscaling() {
        if (!this.autoscale) {
          this.chartOptions = {
            responsive: true,
            animation: false,
            spanGaps: true,
            showLine: true,
            plugins: {
              legend: {
                display: false
              }
            },
            datasets: {
              line: {
                pointRadius: 0 // disable for all `'line'` datasets
              }
            },
            scales: {
              x: {
                display: false
              },
              y: {
                min: this.y_min,
                max: this.y_max,
                grid: {
                  color: '#333333'
                },
              }
            }
          }
        } else {
          this.chartOptions = {
            responsive: true,
            animation: false,
            spanGaps: true,
            showLine: true,
            plugins: {
              legend: {
                display: false
              }
            },
            datasets: {
              line: {
                pointRadius: 0 // disable for all `'line'` datasets
              }
            },
            scales: {
              x: {
                display: false
              },
              y: {
                grid: {
                  color: '#333333'
                },
              }
            }
          }
        }
  
  
      },
      dataUpdateSlow() {
        this.blood_flow = explain.modelData[0]['Ecls.blood_flow'].toFixed(3)
        this.p_int = explain.modelData[0]['Ecls.p_int'].toFixed(1)
        this.p_ven = explain.modelData[0]['Ecls.p_ven'].toFixed(1)
        this.p_art = explain.modelData[0]['Ecls.p_art'].toFixed(1)
        this.p_tmp = explain.modelDataSlow[0]['Ecls.p_tmp'].toFixed(1)
        this.svo2 = explain.modelDataSlow[0]['Ecls.pre_oxy_so2'].toFixed(0)

      },
      dataUpdateRt() {
  
        if (this.alive) {
          // update is every 0.015 ms and the data is sampled with 0.005 ms resolution 
          // (so 3 data points per 0.015 sec = 200 datapoints per second)

          for (let i = 0; i < explain.modelData.length; i++) {
            this.y1_axis.push(explain.modelData[i][this.p1] * this.chart1_factor)
            this.y2_axis.push(explain.modelData[i][this.p2] * this.chart2_factor)
            this.y3_axis.push(explain.modelData[i][this.p3] * this.chart3_factor)
            this.x_axis.push(this.seconds)
            this.seconds += 0.005;
          }
  
          if (this.x_axis.length > this.rtWindowValidated * 200.0) {
            let too_many = this.x_axis.length - (this.rtWindowValidated * 200.0)
            this.x_axis.splice(0, too_many)
            this.y1_axis.splice(0, too_many)
            this.y2_axis.splice(0, too_many)
            this.y3_axis.splice(0, too_many)
          }
  
          if (this.redrawTimer > this.redrawInterval) {
            this.redrawTimer = 0;
            const myChart = this.$refs.myEclsChart.chart
            myChart.data.labels = this.x_axis
            myChart.data.datasets[0].data = [...this.y1_axis]
            myChart.data.datasets[1].data = [...this.y2_axis]
            myChart.data.datasets[2].data = [...this.y3_axis]
            requestAnimationFrame(() => {
              myChart.update()
            })
  
            if (this.show_summary) {
              this.analyzeDataRt()
            }
  
          }
          this.redrawTimer += 0.015
        }
      },
      toggleSummary() {
        if (this.show_summary) {
          this.analyzeData()
        }
  
      },
      dataUpdate() {
  
        let data_set_pres1 = {}
        let data_set_pres2 = {}
        let data_set_pres3 = {}

        if (this.p1 !== '') {
          this.y1_axis = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
          data_set_pres1 = {
            data: this.y1_axis,
            borderColor: 'rgb(192, 0, 0)',
            borderWidth: 1,
            pointStyle: false
          }
        }

        if (this.p2 !== '') {
          this.y2_axis = explain.modelData.map((item) => { return item[this.p2] * this.chart2_factor; });
          data_set_pres2 = {
            data: this.y2_axis,
            borderColor: 'rgb(0, 192, 0)',
            borderWidth: 1,
            pointStyle: false
          }
        }

        if (this.p3 !== '') {
          this.y3_axis = explain.modelData.map((item) => { return item[this.p3] * this.chart3_factor; });
          data_set_pres3 = {
            data: this.y3_axis,
            borderColor: 'rgb(0, 192, 192)',
            borderWidth: 1,
            pointStyle: false
          }
        }
  
        this.x_axis = [...Array(this.y1_axis.length).keys()]
  
        this.chartData = {
          labels: this.x_axis,
          datasets: [data_set_pres1, data_set_pres2, data_set_pres3]
        }
  
        if (this.show_summary) {
          this.analyzeDataRt()
        }
        // prepare for realtime analysis
        this.seconds = 0
        this.x_axis = []
        this.y1_axis = []
        this.y2_axis = []
        this.y3_axis = []
  
      },
      exportData() {
        let header = ""
        let data = {
          time: explain.modelData.map((item) => { return item['time'] }),
        }
  
        if (this.p1 !== "") {
          let h1 = this.selectedModel1.toUpperCase() + this.selectedProp1.toUpperCase() + "_";
          header += h1
          data[h1] = explain.modelData.map((item) => { return (parseFloat(item[this.p1])).toFixed(5) });
        }
        this.exportFileName = `time_vs_${header}.csv`;
        this.writeDataToDisk(data)
  
      },
      writeDataToDisk(data) {
        // download to local disk
        const data_csv = this.convertToCSV(data)
        const blob = new Blob([data_csv], { type: "text/json" });
        // create an element called a
        const a = document.createElement("a");
        a.download = this.exportFileName;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
        // create a synthetic click MouseEvent
        let evt = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        // dispatch the mouse click event
        a.dispatchEvent(evt);
        // remove the element from the document
        a.remove();
      },
      convertToCSV(obj) {
        const headers = Object.keys(obj);
        const rows = [];
  
        // Push the headers as the first row
        rows.push(headers.join(','));
  
        // Determine the number of rows needed by checking the length of one of the arrays
        const numRows = obj[headers[0]].length;
  
        // Loop through the rows of data
        for (let i = 0; i < numRows; i++) {
          const rowData = headers.map((header) => obj[header][i]);
          rows.push(rowData.join(','));
        }
  
        return rows.join('\n');
      },
      processModelState() {
        if (explain.modelState.models) {
          this.ecls_running = explain.modelState.models["Ecls"].ecls_running
          if (this.ecls_running) {
            this.mode = explain.modelState.models["Ecls"].ecls_mode
            explain.watchModelProps([
                "Ecls.blood_flow",
                "Ecls.p_ven", 
                "Ecls.p_int", 
                "Ecls.p_art",
                ])
            explain.watchModelPropsSlow([
                "Ecls.pre_oxy_so2",
                "Ecls.p_tmp"
                ])
          } else {
            this.mode = "OFF"
          }
          this.drainage_origin = explain.modelState.models["Ecls"].drainage_origin
          this.return_target = explain.modelState.models["Ecls"].return_target
          this.sweep_gas = explain.modelState.models["Ecls"].gas_flow
          this.temp = explain.modelState.models["Ecls"].temp_gas
          this.humidity = explain.modelState.models["Ecls"].humidity_gas * 100.0
          this.pump_rpm = explain.modelState.models["Ecls"].pump_rpm
          this.fio2 = explain.modelState.models["Ecls"].fio2_gas * 100.0
          this.co2_gas_flow = explain.modelState.models["Ecls"].co2_gas_flow
          this.clamped = explain.modelState.models["Ecls"].tubing_clamped
          this.pump_occlusive = explain.modelState.models["Ecls"].pump_occlusive
          this.ecls_mode = explain.modelState.models["Ecls"].ecls_mode

          if (this.cannulation_sites.length == 0) {
            Object.values(explain.modelState.models).forEach(model => {
              if (this.cannulation_model_options.includes(model.model_type)) {
                this.cannulation_sites.push(model.name)
              }
            })
          }
        }
      }
    },
    beforeUnmount() {
      this.$bus.off("rtf", () => { if (this.ecls_running) this.dataUpdateRt()});
      this.$bus.off("rts", () => { if (this.ecls_running) this.dataUpdateSlow()});
      this.$bus.off("data", () => { if (this.ecls_running) this.dataUpdate()});
      this.$bus.off("state", this.processModelState)

    },
    mounted() {
      this.$bus.on("rtf", () => { if (this.ecls_running) this.dataUpdateRt()});
      this.$bus.on("rts", () => { if (this.ecls_running) this.dataUpdateSlow()});
      this.$bus.on("data", () => { if (this.ecls_running) this.dataUpdate()});
      this.$bus.on("state", this.processModelState)

      explain.watchModelProps([
        "Ecls.blood_flow",
        "Ecls.p_ven", 
        "Ecls.p_int", 
        "Ecls.p_art"
        ])

      explain.watchModelPropsSlow([
        "Ecls.pre_oxy_so2",
        "Ecls.p_tmp"
        ])
  
      // check whether hires is enabled
      this.toggleHires()
    },
  };
  </script>
  
  <style></style>
  
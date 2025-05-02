<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
      <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
        {{ title }}
      </div>
  
  
      <!-- chart -->
      <div>
        <div class="q-mt-sm row text-overline justify-center"> {{  chart_title }}</div>
        <Line v-if="isEnabled" ref="myEclsChart" id="my-chart-ecls" :options="chartOptions"
          :data="chartData" style="max-height: 250px;" />
      </div>
  
      <div v-if="isEnabled" class="q-mt-sm text-overline justify-center q-gutter-xs row">
        <div>
          <q-toggle class="q-ml-sm q-pb-lg q-mr-sm" v-model="this.ecls_running" left-label label="ECLS running" dense size="sm"
            @update:model-value="toggleEcls" />
        </div>
        <div>
          <q-toggle class="q-ml-sm q-pb-lg q-mr-sm" v-model="clamped" left-label label="clamped" dense size="sm"
            @update:model-value="set_clamp" />
        </div>
        <div>
          <q-btn-toggle v-model="mode" color="grey-9" size="sm" text-color="white" toggle-color="primary" :options="[
            { label: 'VA-ECMO', value: 'VA' },
            { label: 'VV-ECMO', value: 'VV' },
          ]" @update:model-value="update_ecls_settings" />
        </div>


        <div>
          <q-btn-toggle class="q-ml-sm" v-model="curve_param" color="grey-9" size="sm" text-color="white"
            toggle-color="primary" :options="[
              { label: 'PRES', value: 'pres' },
              { label: 'FLOW', value: 'flow' },
            ]" @update:model-value="toggleCurveParam" />
        </div>
  
      </div>
      <!-- ecmo controls -->
      <div v-if="isEnabled && ecls_running && graph_control" class="text-overline justify-center q-gutter-sm row">
        <div>
          <q-toggle class="q-ml-sm q-pb-lg" v-model="state.configuration.chart_hires" label="hi-res" dense size="sm"
            @update:model-value="toggleHires" />
        </div>
        <div>
          <q-input v-if="!state.configuration.chart_hires" class="q-ml-sm q-pb-lg"
            v-model.number="rtWindow" type="number" label="time" filled dense min="1" max="30" hide-bottom-space
            @update:model-value="updateRtWindow" />
        </div>
        </div>
  
      <div v-if="isEnabled && ecls_running" class="text-overline justify-center q-gutter-sm row">
        <div  class="q-mr-sm text-center">
          <div>pump (rpm)</div>
          <q-knob show-value font-size="12px" v-model="pump_rpm" size="50px" :min="0" :max="5000" :step="1"
            :thickness="0.22" color="teal" track-color="grey-3" class="col"
            @update:model-value="set_pump_speed">
            {{ pump_rpm }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">cmh2o</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">gas flow</div>
          <q-knob show-value font-size="12px" v-model="sweep_gas" size="50px" :thickness="0.22" :min="0" :max="5" :step="0.1"
            color="teal" track-color="grey-3" class="col" @update:model-value="set_sweep_gas">
            {{ sweep_gas }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">l/min</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">fio2</div>
          <q-knob show-value font-size="12px" v-model="fio2" size="50px" :thickness="0.22" :min="21" :max="100" :step="1"
            color="teal" track-color="grey-3" class="col" @update:model-value="set_fio2">
            {{ fio2 }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">%</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">co2 flow</div>
          <q-knob show-value font-size="12px" v-model="co2_gas_flow" size="50px" :thickness="0.22" :min="0" :max="1" :step="0.1"
            color="teal" track-color="grey-3" class="col" @update:model-value="set_co2_flow">
            {{ co2_gas_flow }}
          </q-knob>
          <div :style="{ fontSize: '10px' }">l/min</div>
        </div>
      </div>
  
      <!-- <div v-if="isEnabled && ecls_running" class="q-mt-md q-mb-md text-overline justify-center q-gutter-xs row">
        <q-input v-model="et_tube_diameter" @update:model-value="set_ettube_diameter" color="blue" hide-hint filled
          label="et tube diameter (mm)" :min="2.0" :max="5.0" :step="0.5" dense stack-label type="number"
          style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>
  
        </q-input>
        <q-input v-model="et_tube_length" @update:model-value="set_ettube_length" color="blue" hide-hint filled
          label="et tube length (mm)" :min="50" :max="110" :step="5" dense stack-label type="number"
          style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>
        </q-input>
        <q-input v-model="temp" @update:model-value="set_temp" color="blue" hide-hint filled label="temperature (C)"
          :min="0" :max="60" :step="0.1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
          class="q-mr-sm text-center" squared>
        </q-input>
        <q-input v-model="humidity" @update:model-value="set_humidity" color="blue" hide-hint filled label="humidity (%)"
          :min="0" :max="100" :step="1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
          class="q-mr-sm text-center" squared>
        </q-input>
      </div> -->
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
        }],
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
        autoscaleEnabled: true,
        autoscale: false,
        loopMode: false,
        isEnabled: true,
        pump_rpm: 1500.0,
        fio2: 21,
        co2_gas_flow: 0.4,
        sweep_gas: 1.0,
        temp: 37.0,
        humidity: 100,
        clamped: false,
        mode: "OFF",
        x_min: 2,
        x_max: 15.0,
        y_min: 0,
        y_max: 25,
        multipliersEnabled: true,
        scaling: false,
        chart_title: "flow (l/min)",
        chart1_factor: 1.0,
        exportEnabled: true,
        title: "ECLS SYSTEM",
        selectedModel1: "Ecls",
        selectedProp1: "blood_flow",
        p1: "Ecls.blood_flow",
        p1_max: 0.0,
        p1_min: 0.0,
        p1_sd: 0.0,
        p1_mean: 0.0,
        p1_permin: 0.0,
        p1_perbeat: 0.0,
        seconds: 0,
        x_axis: [],
        y1_axis: [],
        redrawInterval: 0.015,
        redrawTimer: 0.0,
        debug_mode: true,
        presets: {},
        update_model: true,
        curve_param: "flow",
        graph_control: false
      };
    },
    methods: {
      toggleCurveParam() {
        if (this.curve_param == "pres") {
          this.p1 = "Ecls.p_ven"
        }
        if (this.curve_param == "flow") {
          this.p1 = "Ecls.blood_flow"
        }
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
      dataUpdateRt() {
  
        if (this.alive) {
          // update is every 0.015 ms and the data is sampled with 0.005 ms resolution (so 3 data points per 0.015 sec = 200 datapoints per second)
          for (let i = 0; i < explain.modelData.length; i++) {
            this.y1_axis.push(explain.modelData[i][this.p1] * this.chart1_factor)
            this.x_axis.push(this.seconds)
            this.seconds += 0.005;
          }
  
          if (this.x_axis.length > this.rtWindowValidated * 200.0) {
            let too_many = this.x_axis.length - (this.rtWindowValidated * 200.0)
            this.x_axis.splice(0, too_many)
            this.y1_axis.splice(0, too_many)
          }
  
          if (this.redrawTimer > this.redrawInterval) {
            this.redrawTimer = 0;
            const myChart = this.$refs.myEclsChart.chart
            myChart.data.labels = this.x_axis
            myChart.data.datasets[0].data = [...this.y1_axis]
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
  
        let data_set_pres = {}
        if (this.p1 !== '') {
          this.y1_axis = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
          data_set_pres = {
            data: this.y1_axis,
            borderColor: 'rgb(192, 0, 0)',
            borderWidth: 1,
            pointStyle: false
          }
        }
  
        this.x_axis = [...Array(this.y1_axis.length).keys()]
  
        this.chartData = {
          labels: this.x_axis,
          datasets: [data_set_pres]
        }
  
        if (this.show_summary) {
          this.analyzeDataRt()
        }
        // prepare for realtime analysis
        this.seconds = 0
        this.x_axis = []
        this.y1_axis = []
  
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
                "Ecls.gas_flow",
                "Ecls.p_ven", 
                "Ecls.p_int", 
                "Ecls.p_art", 
                "Ecls.pre_oxy_bloodgas", 
                "Ecls.post_oxy_bloodgas"
                ])
          } else {
            this.mode = "OFF"
          }
          this.temp = explain.modelState.models["Ecls"].temp_gas
          this.humidity = explain.modelState.models["Ecls"].humidity_gas * 100.0
          this.pump_rpm = explain.modelState.models["Ecls"].pump_rpm
          this.fio2 = explain.modelState.models["Ecls"].fio2_gas * 100.0
          this.co2_gas_flow = explain.modelState.models["Ecls"].co2_gas_flow
          this.clamped = explain.modelState.models["Ecls"].tubing_clamped
        }
      }
    },
    mounted() {
      this.$bus.on("rtf", () => this.dataUpdateRt());
      this.$bus.on("data", () => this.dataUpdate())
      this.$bus.on("state", this.processModelState)
      explain.watchModelProps([
        "Ecls.blood_flow",
        "Ecls.gas_flow",
        "Ecls.p_ven", 
        "Ecls.p_int", 
        "Ecls.p_art", 
        "Ecls.pre_oxy_bloodgas", 
        "Ecls.post_oxy_bloodgas"
        ])
  
      // check whether hires is enabled
      this.toggleHires()
    },
  };
  </script>
  
  <style></style>
  
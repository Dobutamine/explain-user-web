import { readonly } from "vue";
import { BaseModelClass } from "../base_models/BaseModelClass";

export class Heart extends BaseModelClass {
  // static properties
  static model_type = "Heart";
  static model_interface = [
    {
      target: "description",
      type: "string",
      build_prop: true,
      edit_mode: "caption",
      readonly: true,
      caption: "description",
    },
    {
      target: "is_enabled",
      type: "boolean",
      build_prop: true,
      edit_mode: "all",
      readonly: false,
      caption: "enabled",
    },
    {
      caption: "reference heart rate (bpm)",
      target: "heart_rate_ref",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
      readonly: false,
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      caption: "pq time (s)",
      target: "pq_time",
      type: "number",
      delta: 0.001,
      factor: 1.0,
      rounding: 3,
      readonly: false,
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      caption: "qrs time (s)",
      target: "qrs_time",
      type: "number",
      delta: 0.001,
      factor: 1.0,
      rounding: 3,
      readonly: false,
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      caption: "qt time (s)",
      target: "qt_time",
      type: "number",
      delta: 0.001,
      factor: 1.0,
      rounding: 3,
      readonly: false,
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      caption: "av delay time (s)",
      target: "av_delay",
      type: "number",
      delta: 0.0001,
      factor: 1.0,
      rounding: 4,
      readonly: false,
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      caption: "heartrate factor",
      target: "hr_factor",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 1000000
    },
    {
      caption: "ans sensitivity",
      target: "ans_sens",
      type: "number",
      edit_mode: "basic",
      build_prop: "true",
      factor: 1.0,
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 1.0
    },
    {
      caption: "systolic function factor left",
      target: "cont_factor_left",
      type: "factor",
      edit_mode: "factors",
      factor: 1.0,
      delta: 0.01,
      rounding: 2,
      ll: -20,
      ul: 20
    },
    {
      caption: "systolic function factor right",
      target: "cont_factor_right",
      type: "factor",
      edit_mode: "factors",
      factor: 1.0,
      delta: 0.01,
      rounding: 2,
      ll: -20,
      ul: 20
    },
    {
      caption: "diastolic function factor left",
      target: "relax_factor_left",
      type: "factor",
      edit_mode: "factors",
      factor: 1.0,
      delta: 0.01,
      rounding: 2,
      ll: -20,
      ul: 20
    },
    {
      caption: "diastolic function factor right",
      target: "relax_factor_right",
      type: "factor",
      edit_mode: "factors",
      factor: 1.0,
      delta: 0.01,
      rounding: 2,
      ll: -20,
      ul: 20
    },
    {
      caption: "pericardial elastance factor",
      target: "pc_el_factor",
      type: "factor",
      edit_mode: "factors",
      factor: 1.0,
      delta: 0.1,
      rounding: 2,
      ll: 0,
      ul: 200
    },
    {
      caption: "pericardial fluid volume (mL)",
      target: "pc_extra_volume",
      type: "number",
      edit_mode: "basic",
      factor: 1000,
      delta: 1,
      rounding: 0,
      ll: 0,
      ul: 1000
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // independent properties
    // -----------------------------------------------
    this.heart_rate_ref = 110.0; // reference heart rate (beats/minute)
    this.pq_time = 0.1; // pq time (s)
    this.qrs_time = 0.075; // qrs time (s)
    this.qt_time = 0.25; // qt time (s)
    this.av_delay = 0.0005; // delay in the AV-node (s)
    this.ans_sens = 1.0; // sensitivity of the heart for autonomic nervous system control
    this.ans_activity = 1.0; // ans activity simulating B-adrenergic effect on contractility and relaxation
    this.ans_activity_hr = 1.0; // heart rate factor of the autonomic nervous system
    this.hr_factor = 1.0; // heart rate factor
    this.hr_mob_factor = 1.0; // heart rate factor of the myocardial oxygen balance model
    this.hr_temp_factor = 1.0; // heart rate factor of the temperature (not implemented yet)
    this.hr_drug_factor = 1.0; // heart rate factor of the drug model (not implemented yet)

    this.cont_factor = 1.0; // contractility factor
    this.cont_factor_left = 1.0; // left heart contractility factor
    this.cont_factor_right = 1.0; // right heart contractility factor
    this.cont_mob_factor = 1.0; // contractility factor of myocardial oxygen balance model
    this.cont_drug_factor = 1.0; // contractility factor of drug model (not implemented yet)

    this.relax_factor = 1.0; // relaxation factor (higher is less relaxation!)
    this.relax_factor_left = 1.0; // left heart relaxation factor
    this.relax_factor_right = 1.0; // right heart relaxation factor
    this.relax_mob_factor = 1.0; // relaxation factor of myocardial oxygen balance model
    this.relax_drug_factor = 1.0; // relaxation factor of drug model (not implemented yet)

    this.pc_el_factor = 1.0; // elastance factor of the pericardium
    this.pc_extra_volume = 0.0; // additional volume of the pericardium
  
    // -----------------------------------------------
    // dependent properties
    // -----------------------------------------------
    this.heart_rate = 120.0; // calculated heart rate (beats/minute)
    this.cardiac_cycle_state = 0;

    this.ecg_signal = 0.0; // ecg signal (mV)
    this.ncc_ventricular = 0; // ventricular contraction counter
    this.ncc_atrial = 0; // atrial contraction counter
    this.cardiac_cycle_running = 0; // signal whether or not the cardiac cycle is running (0 = not, 1 = running)
    this.cardiac_cycle_time = 0.353; // cardiac cycle time (s)

    this.lv_edv = this.lv_esv = 0.0
    this.lv_edp = 0.0
    this.lv_esp = 0.0
    this.lv_sp = 0.0
    this.lv_sv = 0.0
    this.lv_ef = 0.0

    this.rv_edv = 0.0
    this.rv_esv = 0.0
    this.rv_edp = 0.0
    this.rv_esp = 0.0
    this.rv_sp = 0.0
    this.rv_sv = 0.0
    this.rv_ef = 0.0

    this.ra_edv = 0.0
    this.ra_esv = 0.0
    this.ra_edp = 0.0
    this.ra_esp = 0.0
    this.ra_sp = 0.0

    this.la_edv = 0.0
    this.la_esv = 0.0
    this.la_edp = 0.0
    this.la_esp = 0.0
    this.la_sp = 0.0


    // -----------------------------------------------
    // local properties
    // -----------------------------------------------
    this._kn = 0.579; // constant of the activation curve
    this._prev_cardiac_cycle_running = 0;
    this._prev_cardiac_cycle_state = 0;
    this._temp_cardiac_cycle_time = 0.0;
    this._sa_node_interval = 1.0;
    this._sa_node_timer = 0.0;
    this._av_delay_timer = 0.0;
    this._pq_timer = 0.0;
    this._pq_running = false;
    this._av_delay_running = false;
    this._qrs_timer = 0.0;
    this._qrs_running = false;
    this._ventricle_is_refractory = false;
    this._qt_timer = 0.0;
    this._qt_running = false;
    this._la = null;
    this._lv = null;
    this._ra = null;
    this._rv = null;
    this._la_lv = null;
    this._lv_aa = null;
    this._ra_rv = null;
    this._coronaries = null;

    this._systole_running = false
    this._diastole_running = false

    this._prev_la_lv_flow = 0.0;
    this._prev_lv_aa_flow = 0.0;
    this._prev_cont_factor = 1.0;
    this._prev_cont_factor_left = 1.0;
    this._prev_cont_factor_right = 1.0;

    this._prev_relax_factor = 1.0;
    this._prev_relax_factor_left = 1.0;
    this._prev_relax_factor_right = 1.0;

    this._prev_pc_el_factor = 1.0;
    
    this._update_counter_factors = 0.0;
    this._update_interval_factors = 0.015;
  }

  analyze() {
    // state going from diastole to systole (end_diastolic)
    if (this._prev_cardiac_cycle_state === 0 && this.cardiac_cycle_state === 1) {
      this.lv_edv = this._lv.vol
      this.lv_edp = this._lv.pres_in
      
      this.rv_edv = this._rv.vol
      this.rv_edp = this._rv.pres_in

    }

    // state going from systole to diastole (end systolic)
    if (this._prev_cardiac_cycle_state === 1 && this.cardiac_cycle_state === 0) {
      this.lv_esv = this._lv.vol
      this.lv_esp = this._lv.pres_in

      this.la_esv = this._la.vol
      this.la_esp = this._la.pres_in
      
      this.rv_esv = this._rv.vol
      this.rv_esp = this._rv.pres_in
      
      this.ra_esv = this._ra.vol
      this.ra_esp = this._ra.pres_in
    }

    // state going from diastole to systole (end diastolic)
    if (this._prev_cardiac_cycle_state === 0 && this.cardiac_cycle_state === 1) {
      this.lv_edv = this._lv.vol
      this.lv_esp = this._lv.pres_in

      this.la_edv = this._la.vol
      this.la_esp = this._la.pres_in
      
      this.rv_edv = this._rv.vol
      this.rv_esp = this._rv.pres_in
      
      this.ra_edv = this._ra.vol
      this.ra_esp = this._ra.pres_in

      // store the other parameters
      this.lv_sv = this.lv_edv - this.lv_esv
      this.rv_sv = this.rv_edv - this.lv_edv
      this.lv_ef = this.lv_sv / this.lv_edv
      this.rv_ef = this.rv_sv / this.rv_edv
    }
  }

  calc_model() {
    // get a reference to the heart component models
    this._la = this._model_engine.models["LA"];
    this._lv = this._model_engine.models["LV"];
    this._ra = this._model_engine.models["RA"];
    this._rv = this._model_engine.models["RV"];
    this._la_lv = this._model_engine.models["LA_LV"]
    this._ra_rv = this._model_engine.models["RA_RV"]
    this._lv_aa = this._model_engine.models["LV_AA"]
    this._coronaries = this._model_engine.models["COR"];
    this._pc = this._model_engine.models["PERICARDIUM"];

    // set the factors
    this._update_counter_factors += this._t
    if (this._update_counter_factors > this._update_interval_factors) {
      this._update_counter_factors = 0.0;

      const cont_left = this.cont_factor_left;
      const cont_right = this.cont_factor_right;
      if (
        cont_left !== this._prev_cont_factor_left ||
        cont_right !== this._prev_cont_factor_right
      ) {
        this.set_contractillity(cont_left, cont_right);
      }
      this._prev_cont_factor_left = cont_left;
      this._prev_cont_factor_right = cont_right;

      const relax_left = this.relax_factor_left;
      const relax_right = this.relax_factor_right;
      if (
        relax_left !== this._prev_relax_factor_left ||
        relax_right !== this._prev_relax_factor_right
      ) {
        this.set_relaxation(relax_left, relax_right);
      }
      this._prev_relax_factor_left = relax_left;
      this._prev_relax_factor_right = relax_right;

      const pc_el = this.pc_el_factor;
      if (
        pc_el !== this._prev_pc_el_factor
      ) {
        this.set_pericardium(pc_el, this.pc_extra_volume);
      }
      this._prev_pc_el_factor = pc_el;


      // set the new volume
      this._pc.vol_extra = this.pc_extra_volume;
    }

    // store the previous cardiac cycle state
    this._prev_cardiac_cycle_running = this.cardiac_cycle_running;

    // store the previous state
    this._prev_cardiac_cycle_state = this.cardiac_cycle_state

    // when then mitral valve closes the systole starts
    if (this._prev_la_lv_flow > 0.0 && this._la_lv.flow <= 0.0) {
      // mitral valve closes so the systole starts
      this._systole_running = true
    }
    // store the previous flow
    this._prev_la_lv_flow = this._la_lv.flow

    if (this._systole_running) {
      // check whether the aortic valve closes
      if (this._prev_lv_aa_flow > 0.0 && this._lv_aa.flow <= 0.0) {
        // aortic valve closes so the systole ends
        this._systole_running = false
      }
    }
    // store the previous flow
    this._prev_lv_aa_flow = this._lv_aa.flow

    // set the cardiac cycle
    if (this._systole_running) {
      this.cardiac_cycle_state = 1
      this._diastole_running = false
    } else {
      this.cardiac_cycle_state = 0
      this._diastole_running = true
    }

    // calculate heart rate from the reference value and influencing factors
    this.heart_rate = this.heart_rate_ref +
      (this.ans_activity_hr - 1.0) * this.heart_rate_ref * this.ans_sens +
      (this.hr_factor - 1.0) * this.heart_rate_ref +
      (this.hr_mob_factor - 1.0) * this.heart_rate_ref +
      (this.hr_temp_factor - 1.0) * this.heart_rate_ref +
      (this.hr_drug_factor - 1.0) * this.heart_rate_ref;

    // calculate qtc time depending on heart rate
    this.cqt_time = this.calc_qtc(this.heart_rate);

    // calculate the sinus node interval (in seconds) based on heart rate
    this._sa_node_interval = 60.0 / this.heart_rate;

    // sinus node period check
    if (this._sa_node_timer > this._sa_node_interval) {
      this._sa_node_timer = 0.0; // reset the timer
      this._pq_running = true; // start the pq-time
      this.ncc_atrial = -1; // reset atrial activation counter
      this.cardiac_cycle_running = 1; // cardiac cycle starts
      this._temp_cardiac_cycle_time = 0.0; // reset cardiac cycle time
    }

    // pq time period check
    if (this._pq_timer > this.pq_time) {
      this._pq_timer = 0.0;
      this._pq_running = false;
      this._av_delay_running = true; // start av-delay
    }

    // av delay period check
    if (this._av_delay_timer > this.av_delay) {
      this._av_delay_timer = 0.0;
      this._av_delay_running = false;

      if (!this._ventricle_is_refractory) {
        this._qrs_running = true; // start qrs
        this.ncc_ventricular = -1; // reset ventricular activation
      }
    }

    // qrs time period check
    if (this._qrs_timer > this.qrs_time) {
      this._qrs_timer = 0.0;
      this._qrs_running = false;
      this._qt_running = true; // start qt
      this._ventricle_is_refractory = true;
    }

    // qt time period check
    if (this._qt_timer > this.cqt_time) {
      this._qt_timer = 0.0;
      this._qt_running = false;
      this._ventricle_is_refractory = false; // ventricles leave refractory state
      this.cardiac_cycle_running = 0; // end of cardiac cycle
      this.cardiac_cycle_time = this._temp_cardiac_cycle_time;
    }

    // increment timers with the model's time step
    this._sa_node_timer += this._t;

    if (this.cardiac_cycle_running === 1) {
      this._temp_cardiac_cycle_time += this._t;
    }

    if (this._pq_running) {
      this._pq_timer += this._t;
    }

    if (this._av_delay_running) {
      this._av_delay_timer += this._t;
    }

    if (this._qrs_running) {
      this._qrs_timer += this._t;
    }

    if (this._qt_running) {
      this._qt_timer += this._t;
    }

    // increase heart activation function counters
    this.ncc_atrial += 1;
    this.ncc_ventricular += 1;

    // calculate the varying elastance factor
    this.calc_varying_elastance();
  }

  calc_varying_elastance() {
    // calculate atrial activation factor
    let _atrial_duration = this.pq_time / this._t;
    if (this.ncc_atrial >= 0 && this.ncc_atrial < _atrial_duration) {
      this.aaf = Math.sin(Math.PI * (this.ncc_atrial / _atrial_duration));
    } else {
      this.aaf = 0.0;
    }

    // calculate ventricular activation factor
    let _ventricular_duration = (this.qrs_time + this.cqt_time) / this._t;
    if (
      this.ncc_ventricular >= 0 &&
      this.ncc_ventricular < _ventricular_duration
    ) {
      this.vaf =
        (this.ncc_ventricular / (this._kn * _ventricular_duration)) *
        Math.sin(Math.PI * (this.ncc_ventricular / _ventricular_duration));
    } else {
      this.vaf = 0.0;
    }

    // incorporate the ans factors ans sensitivity on the heart function
    this._la.ans_sens = this.ans_sens
    this._ra.ans_sens = this.ans_sens
    this._lv.ans_sens = this.ans_sens
    this._rv.ans_sens = this.ans_sens

    this._la.ans_activity = this.ans_activity
    this._ra.ans_activity = this.ans_activity
    this._lv.ans_activity = this.ans_activity
    this._rv.ans_activity = this.ans_activity

    // transfer the activation factor to the heart components
    this._la.act_factor = this.aaf;
    this._ra.act_factor = this.aaf;

    this._lv.act_factor = this.vaf;
    this._rv.act_factor = this.vaf;
    this._coronaries.act_factor = this.vaf;

    // analyze current state
    this.analyze()
  }

  calc_qtc(hr) {
    if (hr > 10.0) {
      // Bazett's formula
      return this.qt_time * Math.sqrt(60.0 / hr);
    } else {
      return this.qt_time * 2.449;
    }
  }

  set_pericardium(new_el_factor, new_volume) {
    // get the current factor from the model
    let f_pc_el = this._pc.el_base_factor_ps;

    // calculate the delta
    let delta = new_el_factor - this._prev_pc_el_factor;

    // guard the extremes
    f_pc_el = Math.max(f_pc_el + delta, 0);

    // set the new factor
    this._pc.el_base_factor_ps = f_pc_el;
  }

  set_contractillity(new_cont_factor_left, new_cont_factor_right) {
    // get the current factors from the model
    let f_ps_la = this._la.el_max_factor_ps;
    let f_ps_lv = this._lv.el_max_factor_ps;
    let f_ps_ra = this._ra.el_max_factor_ps;
    let f_ps_rv = this._rv.el_max_factor_ps;

    let delta_left = new_cont_factor_left - this._prev_cont_factor_left;
    let delta_right = new_cont_factor_right - this._prev_cont_factor_right;

    // add the increase/decrease in factor
    f_ps_la = Math.max(f_ps_la + delta_left, 0);
    f_ps_lv = Math.max(f_ps_lv + delta_left, 0);
    f_ps_ra = Math.max(f_ps_ra + delta_right, 0);
    f_ps_rv = Math.max(f_ps_rv + delta_right, 0);

    // transfer the factors
    this._la.el_max_factor_ps = f_ps_la
    this._lv.el_max_factor_ps = f_ps_lv
    this._ra.el_max_factor_ps = f_ps_ra
    this._rv.el_max_factor_ps = f_ps_rv

    // store the new factor
    this.cont_factor_left = new_cont_factor_left;
    this.cont_factor_right = new_cont_factor_right;
  }

  set_relaxation(new_relax_factor_left, new_relax_factor_right) {
    // get the current factors from the model
    let f_ps_la = this._la.el_min_factor_ps;
    let f_ps_lv = this._lv.el_min_factor_ps;
    let f_ps_ra = this._ra.el_min_factor_ps;
    let f_ps_rv = this._rv.el_min_factor_ps;

    let delta_left = new_relax_factor_left - this._prev_relax_factor_left;
    let delta_right = new_relax_factor_right - this._prev_relax_factor_right;

    // add the increase/decrease in factor
    f_ps_la = Math.max(f_ps_la + delta_left, 0);
    f_ps_lv = Math.max(f_ps_lv + delta_left, 0);
    f_ps_ra = Math.max(f_ps_ra + delta_right, 0);
    f_ps_rv = Math.max(f_ps_rv + delta_right, 0);

    // transfer the factors
    this._la.el_min_factor_ps = f_ps_la
    this._lv.el_min_factor_ps = f_ps_lv
    this._ra.el_min_factor_ps = f_ps_ra
    this._rv.el_min_factor_ps = f_ps_rv

    // store the new factor
    this.relax_factor_left = new_relax_factor_left;
    this.relax_factor_right = new_relax_factor_right;
  }
}

// import the wasm module
import createModule from "../wasm/bc_ems";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
const use_wasm        = true; // use wasm module for calculations
const kw              = 2.5119e-11; // water dissociation constant
const kc              = 7.94328235e-4; // carbonic acid dissociation constant
const kd              = 6.0255959e-8; // bicarbonate dissociation constant
const alpha_co2p      = 0.03067; // CO2 solubility coefficient
const left_hp_wide    = 5.848931925e-6; // lower bound for H⁺ concentration
const right_hp_wide   = 3.16227766017e-4; // upper bound for H⁺ concentration
const delta_ph_limits = 0.1; // delta for pH limits
const n               = 2.7; // Hill coefficient
const alpha_o2        = 1.38e-5; // O2 solubility coefficient
const left_o2_wide    = 0; // lower bound for pO2
const right_o2_wide   = 800.0; // upper bound for pO2
const delta_o2_limits = 10.0; // delta for pO2 limits
const brent_accuracy  = 1e-8;
const max_iterations  = 100;
const gas_constant    = 62.36367;

// -----------------------------------------------------------------------------
// Independent variables
// -----------------------------------------------------------------------------

let P50_0 = 20.0; // PO2 at which 50% of Hgb is saturated by O2 (fetal = 18.8 (high Hb O2 affinity), neonatal = 20.0, adult = 26.7)
let P50 = 0;
let log10_p50 = 0;
let P50_n = 0;
let left_o2 = 0; // lower bound for pO2
let right_o2 = 800.0; // upper bound for pO2
let left_hp = 5.848931925e-6; // lower bound for H⁺ concentration
let right_hp = 3.16227766017e-4; // upper bound for H⁺ concentration

// -----------------------------------------------------------------------------
// State variables
// -----------------------------------------------------------------------------
let ph = 0.0;
let po2 = 0.0;
let so2 = 0.0;
let pco2 = 0.0;
let hco3 = 0.0;
let be = 0.0;
let to2 = 0.0;
let hemoglobin = 0.0;
let dpg = 5.0;
let temp = 0.0;
let tco2 = 0.0;
let sid = 0.0;
let albumin = 0.0;
let phosphates = 0.0;
let uma = 0.0;
let prev_ph = 7.37; // previous pH value, used to set the limits for H⁺ concentration
let prev_po2 = 18.7; // previous pO2 value, used to set the limits for pO2
let dpH = 0;             //Bohr effect: ↓pH → right shift → ↑P₅₀)
let dpCO2 = 0;       // Haldane effect: ↑pCO2 → right shift → ↑P₅₀
let dT = 0;          // ↑T → right shift → ↑P₅₀
let dDPG = 0;          // ↑DPG → right shift → ↑P₅₀

// -----------------------------------------------------------------------------
// Wasm parameters
// -----------------------------------------------------------------------------

let wasm_parameters = {
    tco2: 23.5,
    to2: 4.02,
    temp: 37.0,
    hemoglobin: 8.0,
    na: 138.0,
    k: 3.5,
    ca: 1.0,
    mg: 0.75,
    cl: 108.0,
    lact: 1.0,
    albumin: 25.0,
    phosphates: 1.64,
    dpg: 5.0,
    uma: 3.8,
    prev_po2: 18.7,
    prev_ph: 7.37,
    p50_0: 18.8,
}

let wasm = null;
if (use_wasm) {
    wasm = await createModule({locateFile: p => new URL('../wasm/bc_ems.wasm', import.meta.url).pathname})
}


export function calc_blood_composition(bc) {
    if (use_wasm) {
        _calc_blood_composition_wasm(bc);
    } else {
       _calc_blood_composition_js(bc);
    }
}
// This function calculates the blood composition using the WASM module
function _calc_blood_composition_wasm(bc) {
    //console.log("WASM Blood Composition Calculation Input:", bc);
    wasm_parameters.tco2 = bc.tco2;
    wasm_parameters.to2 = bc.to2;
    wasm_parameters.temp = bc.temp || 37.0;
    wasm_parameters.hemoglobin = bc.solutes["hemoglobin"] || 8.0;
    wasm_parameters.na = bc.solutes["na"] || 138.0;
    wasm_parameters.k = bc.solutes["k"] || 3.5;
    wasm_parameters.ca = bc.solutes["ca"] || 1.0;
    wasm_parameters.cl = bc.solutes["cl"] || 108.0;
    wasm_parameters.lact = bc.solutes["lact"] || 1.0;
    wasm_parameters.mg = bc.solutes["mg"] || 0.75;
    wasm_parameters.albumin = bc.solutes["albumin"] || 25.0;
    wasm_parameters.phosphates = bc.solutes["phosphates"] || 1.64;
    wasm_parameters.uma = bc.solutes["uma"] || 3.8;
    wasm_parameters.prev_ph = bc.ph || 7.37;
    wasm_parameters.prev_po2 = bc.po2 || 18.7;

    const result = wasm.calc_blood_composition(wasm_parameters);

    if (!result.error && !isNaN(result.so2)) {
        bc.ph = result.ph;
        bc.pco2 = result.pco2;
        bc.hco3 = result.hco3;
        bc.be = result.be;
        bc.po2 = result.po2;
        bc.so2 = result.so2;
    }
    //console.log("WASM Blood Composition Calculation Result:", result);
}

// These functions are the same as in the wasm module, but implemented in JavaScript
function _calc_blood_composition_js(bc) {
    let sol = bc.solutes;
    tco2 = bc.tco2;
    to2 = bc.to2;
    sid = sol["na"] + sol["k"] + 2 * sol["ca"] + 2 * sol["mg"] - sol["cl"] - sol["lact"];
    albumin = sol["albumin"];
    phosphates = sol["phosphates"];
    uma = sol["uma"];
    hemoglobin = sol["hemoglobin"];
    temp = bc.temp;
    prev_ph = bc.prev_ph || 7.37; // previous pH value, used to set the limits for H⁺ concentration
    prev_po2 = bc.prev_po2 || 18.7; // previous pO2 value, used to set the limits for pO2

    // set the wide limits based
    left_hp = left_hp_wide; // lower bound for H⁺ concentration
    right_hp = right_hp_wide; // upper bound for H⁺ concentration

    // set the limits based on the previous calculations if available
    if (prev_ph > 0) {
        left_hp = Math.pow(10.0, -(prev_ph + delta_ph_limits)) * 1000.0;
        right_hp = Math.pow(10.0, -(prev_ph - delta_ph_limits)) * 1000.0;
    }

    let hp = _brent_root_finding(_net_charge_plasma, left_hp, right_hp, max_iterations, brent_accuracy);
    if (hp > 0) {
        be =(hco3 - 25.1 + (2.3 * hemoglobin + 7.7) * (ph - 7.4)) * (1.0 - 0.023 * hemoglobin);
        bc.ph = ph;
        bc.pco2 = pco2;
        bc.hco3 = hco3;
        bc.be = be;
    } else {
        //console.log('small limit ab root finding failed in:', bc.name)
        // If the root finding failed, we will use the wide limits
        left_hp = left_hp_wide; // wide lower bound for H⁺ concentration
        if (left_hp < 0) left_hp = 0; // ensure lower bound is not negative
        right_hp = right_hp_wide; // wide upper bound for H⁺ concentration
        hp = _brent_root_finding(_net_charge_plasma, left_hp, right_hp, max_iterations, brent_accuracy);
        if (hp > 0) {
            be =(hco3 - 25.1 + (2.3 * hemoglobin + 7.7) * (ph - 7.4)) * (1.0 - 0.023 * hemoglobin);
            bc.ph = ph;
            bc.pco2 = pco2;
            bc.hco3 = hco3;
            bc.be = be;
        } else {
          console.log('definitive ab root finding failed in:', bc.name)
        }
    }

    dpH = ph - 7.40;             //Bohr effect: ↓pH → right shift → ↑P₅₀)
    dpCO2 = pco2 - 40.0;         // Haldane effect: ↑pCO2 → right shift → ↑P₅₀
    dT = temp - 37.0;            // ↑T → right shift → ↑P₅₀
    dDPG = dpg - 5.0;            // ↑DPG → right shift → ↑P₅₀

    log10_p50 = Math.log10(P50_0) - 0.48 * dpH + 0.014 * dpCO2 + 0.024 * dT + 0.051 * dDPG;
    P50 = Math.pow(10.0, log10_p50);
    P50_n = Math.pow(P50, n);

    // set dynamic limits off
    let dyn_limits_used_oxy = false;
    // set the wide o2 intervals
    left_o2 = left_o2_wide; // lower bound po2
    right_o2 = right_o2_wide; // upper bound po2
    // if we have a previous po2 we can use this for dynamic limiting
    if (prev_po2 > 0) {
        left_o2 = prev_po2 - delta_o2_limits;
        if (left_o2 < 0) left_o2 = 0; // ensure lower bound is not negative
        right_o2 = prev_po2 + delta_o2_limits;
        dyn_limits_used_oxy = true;
    }

    // calculate the po2 and so2 using the brent root finding procedure
    let po2 = _brent_root_finding(_do2_content, left_o2, right_o2, max_iterations, brent_accuracy);
    if (po2 > -1) {
        bc.po2 = po2;
        bc.so2 = so2 * 100.0;
        bc.prev_po2 = po2;
    } else {
      // console.log('small limit oxy root finding failed in:', bc.name)
      if (dyn_limits_used_oxy) {
        // now try again with the wide limits
        left_o2 = left_o2_wide; // lower bound po2
        right_o2 = right_o2_wide; // upper bound po2
        po2 = _brent_root_finding(_do2_content, left_o2, right_o2, max_iterations, brent_accuracy);
        if (po2 > -1) {
          bc.po2 = po2;
          bc.so2 = so2 * 100.0;
          bc.prev_po2 = po2;
        } else {
          console.log('definitive oxy root finding failed in:', bc.name)
        }
      }
    }
}

function _net_charge_plasma(hp_estimate) {
    ph = -Math.log10(hp_estimate / 1000.0);
    let cco2p = tco2 / (1.0 + kc/hp_estimate + (kc*kd)/(hp_estimate * hp_estimate));
    hco3       = (kc * cco2p) / hp_estimate;
    let co3p = (kd * hco3) / hp_estimate;
    let ohp  = kw / hp_estimate;

    pco2 = cco2p / alpha_co2p;

    let a_base = albumin*(0.123*ph - 0.631) + phosphates*(0.309*ph - 0.469);

    return hp_estimate + sid - hco3 - 2.0*co3p - ohp - a_base - uma;
}

function _calc_so2(po2_estimate) {
    let po2_n = Math.pow(po2_estimate, n);
    let denom = po2_n + P50_n;
    return po2_n / denom;
}

function _do2_content(po2_estimate) {
  // calculate the saturation from the current po2 from the current po2 estimate
  so2 = _calc_so2(po2_estimate);

  // calculate the to2 from the current po2 estimate
  // INPUTS: po2 in mmHg, so2 in fraction, hemoglobin in mmol/l
  // convert the hemoglobin unit from mmol/l to g/dL  (/ 0.6206)
  // convert to output from ml O2/dL blood to ml O2/l blood (* 10.0)
  let to2_new_estimate = (0.0031 * po2_estimate + 1.36 * (hemoglobin / 0.6206) * so2) * 10.0;

  // conversion factor for converting ml O2/l to mmol/l
  let mmol_to_ml = (gas_constant * (273.15 + temp)) / 760.0;

  // convert the ml O2/l to mmol/l
  to2_new_estimate = to2_new_estimate / mmol_to_ml;

  // calculate the difference between the real to2 and the to2 based on the new po2 estimate and return it to the brent root finding function
  let dto2 = to2 - to2_new_estimate;

  return dto2;
}

/*
// this function is not functioning well in extreme po2's (don;t )
function _do2_content_error(po2_estimate) {
    // calculate the O2 saturation
    so2 = _calc_so2_sev(po2_estimate);
    // calculate the difference between the TO2 and the calculated TO2
    return hemoglobin * so2 + alpha_o2 * po2_estimate - to2;
}

// high overhead to calculate the so2 using the severing house method
function _calc_so2_sev(po2_estimate) {
  // calculate the saturation from the po2 depending on the ph,be, temperature and dpg level.
  let a = 1.04 * (7.4 - ph) + 0.005 * be + 0.07 * (dpg - 5.0);
  let b = 0.055 * (temp + 273.15 - 310.15);
  let x0 = 1.875 + a + b;
  let h0 = 3.5 + a;
  let x = Math.log(po2_estimate * 0.1333); // po2 in kPa
  let y = x - x0 + h0 * Math.tanh(0.5343 * (x - x0)) + 1.875;

  // return the o2 saturation in fraction so 0.98
  return 1.0 / (Math.exp(-y) + 1.0);
}
*/

function _brent_root_finding(f, x0, x1, max_iter, tolerance) {
  let fx0 = f(x0);
  let fx1 = f(x1);

  if (fx0 * fx1 > 0) {
    return -1;
  }

  if (Math.abs(fx0) < Math.abs(fx1)) {
    [x0, x1] = [x1, x0];
    [fx0, fx1] = [fx1, fx0];
  }

  let x2 = x0,
    fx2 = fx0,
    d = 0,
    mflag = true,
    steps_taken = 0;

  try {
    while (steps_taken < max_iter) {
      if (Math.abs(fx0) < Math.abs(fx1)) {
        [x0, x1] = [x1, x0];
        [fx0, fx1] = [fx1, fx0];
      }

      let new_point;
      if (fx0 !== fx2 && fx1 !== fx2) {
        let L0 = (x0 * fx1 * fx2) / ((fx0 - fx1) * (fx0 - fx2));
        let L1 = (x1 * fx0 * fx2) / ((fx1 - fx0) * (fx1 - fx2));
        let L2 = (x2 * fx1 * fx0) / ((fx2 - fx0) * (fx2 - fx1));
        new_point = L0 + L1 + L2;
      } else {
        new_point = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
      }

      if (
        new_point < (3 * x0 + x1) / 4 ||
        new_point > x1 ||
        (mflag && Math.abs(new_point - x1) >= Math.abs(x1 - x2) / 2) ||
        (!mflag && Math.abs(new_point - x1) >= Math.abs(x2 - d) / 2) ||
        (mflag && Math.abs(x1 - x2) < tolerance) ||
        (!mflag && Math.abs(x2 - d) < tolerance)
      ) {
        new_point = (x0 + x1) / 2;
        mflag = true;
      } else {
        mflag = false;
      }

      let fnew = f(new_point);
      d = x2;
      x2 = x1;

      if (fx0 * fnew < 0) {
        x1 = new_point;
        fx1 = fnew;
      } else {
        x0 = new_point;
        fx0 = fnew;
      }

      steps_taken += 1;

      if (Math.abs(fnew) < tolerance) {
        return new_point;
      }
    }
  } catch {
    return -1;
  }

  return -1;
}

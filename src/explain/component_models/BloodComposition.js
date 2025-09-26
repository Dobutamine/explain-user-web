// import the wasm module

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
const kw              = 2.5119e-11; // water dissociation constant
const kc              = 7.94328235e-4; // carbonic acid dissociation constant
const kd              = 6.0255959e-8; // bicarbonate dissociation constant
const alpha_co2p      = 0.03067; // CO2 solubility coefficient
const left_hp_wide    = 5.848931925e-6; // lower bound for H⁺ concentration
const right_hp_wide   = 3.16227766017e-4; // upper bound for H⁺ concentration
const delta_ph_limits = 0.1; // delta for pH limits
const left_o2_wide    = 0; // lower bound for pO2
const right_o2_wide   = 800.0; // upper bound for pO2
const brent_accuracy  = 1e-8;
const max_iterations  = 100;
const gas_constant    = 62.36367;

// -----------------------------------------------------------------------------
// Independent variables
// -----------------------------------------------------------------------------
let left_o2 = 0.0; // lower bound for pO2
let right_o2 = 800.0; // upper bound for pO2
let left_hp = 5.848931925e-6; // lower bound for H⁺ concentration
let right_hp = 3.16227766017e-4; // upper bound for H⁺ concentration

// -----------------------------------------------------------------------------
// State variables
// -----------------------------------------------------------------------------
let hp = 0.0;
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


export function calc_blood_composition(bc) {
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

    // set the wide limits based
    left_hp = left_hp_wide; // lower bound for H⁺ concentration
    right_hp = right_hp_wide; // upper bound for H⁺ concentration

    // set the limits based on the previous calculations if available
    if (prev_ph > 0) {
        left_hp = Math.pow(10.0, -(prev_ph + delta_ph_limits)) * 1000.0;
        right_hp = Math.pow(10.0, -(prev_ph - delta_ph_limits)) * 1000.0;
    }

    hp = _brent_root_finding(_net_charge_plasma, left_hp, right_hp, max_iterations, brent_accuracy);
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

    // set the wide o2 intervals
    left_o2 = left_o2_wide; // lower bound po2
    right_o2 = right_o2_wide; // upper bound po2

    // calculate the po2 and so2 using the brent root finding procedure
    po2 = _brent_root_finding(_do2_content, left_o2, right_o2, max_iterations, brent_accuracy);
    if (po2 > -1) {
        bc.po2 = po2;
        bc.so2 = so2 * 100.0;
    } else {
      console.log('definitive oxy root finding failed in:', bc.name)
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

function _do2_content(po2_estimate) {
  // calculate the saturation from the current po2 from the current po2 estimate
  so2 = _calc_so2_sev(po2_estimate);

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

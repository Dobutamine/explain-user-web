/**
 * Calculate blood pO₂ and O₂ saturation from total O₂ content.
 *
 * @param {number} Ctot     – total O₂ concentration in mmol/L
 * @param {number} pH       – blood pH
 * @param {number} pCO2     – pCO₂ in mmHg
 * @param {number} temp     – temperature in °C
 * @param {number} dpg      – 2,3‑DPG in mmol/L
 * @param {number} hb       – hemoglobin in mmol tetramers per L
 * @param {number} p50_std  – reference P₅₀ of hemoglobin at pH 7.4, 37°C, DPG=5 (adult Hb=26.8, fetal Hb=19.8)
 * @returns {{pO2: number, sO2: number}}  – computed pO₂ (mmHg) and SaO₂ (0–1)
 */
function calcBloodGas(Ctot, pH, pCO2, temp, dpg, hb, p50_std=26.8) {
    // 1) Constants & coefficients
    const alpha = 0.00138;                  // O₂ solubility mmol/(L·mmHg)
    const hill_n  = 2.7;                    // Hill coefficient
    // Bohr‐effect: log10(p50) shifts per ΔpH, ΔT, ΔDPG, ΔpCO₂:
    const bohr_pH  =  0.48;                 // per pH unit
    const bohr_T   =  0.024;                // per °C
    const bohr_DPG =  0.014;                // per mmol/L
    const bohr_pCO2=  0.003;                // per mmHg (small)
  
    // 2) Compute shifted P50
    const dpH   = 7.4 - pH;
    const dT    = temp - 37.0;
    const ddpg  = dpg  - 5.0;
    const dpC   = pCO2 - 40.0;
    const logP50 = Math.log10(p50_std)
                  + bohr_pH   * dpH
                  + bohr_T    * dT
                  + bohr_DPG  * ddpg
                  + bohr_pCO2 * dpC;
    const p50 = Math.pow(10, logP50);
  
    // 3) Hill‐type saturation curve
    function sO2(pO2) {
      const pO2n = Math.pow(pO2, hill_n);
      return pO2n / (pO2n + Math.pow(p50, hill_n));
    }
  
    // 4) Mass‐balance: f(pO2) = α·pO2 + hb·sO2(pO2) – Ctot = 0
    /*  Hb in mmol/l is actually the monomer heme-concentration. So 1 mmol of heme binds 1 mmol of O2
        This comes from the conversion from Hb in g/dL to mmol/l where Hb using mass looks
        at the hexamere hemoglobin and the conversion to mmol/l uses the 0.6206 factor which is the molar mass of 1 heme group
        Converting to mmol heme/L requires knowing whether you’re using monomer (≈16 kDa) or tetramer (≈64.5 kDa) molar mass. 
        1 g/dL ≃ 0.6206 mmol/L heme (monomer basis) or ≃ 0.155 mmol/L tetramer. 
        Because of this ambiguity, labs stick with mass units.
    */
    function f(pO2) {
      return alpha * pO2 + hb * sO2(pO2) - Ctot;
    }
  
    // 5) Solve for pO2 by bisection on [0, 300 mmHg]
    let lo = 0, hi = 300, mid;
    let f_lo = f(lo), f_hi = f(hi);
    if (f_lo * f_hi > 0) {
      throw new Error("Ctot out of physiological range; no root in [0,300].");
    }
    for (let i = 0; i < 60; i++) {
      mid = 0.5 * (lo + hi);
      const f_mid = f(mid);
      if (f_lo * f_mid <= 0) {
        hi = mid;
        f_hi = f_mid;
      } else {
        lo = mid;
        f_lo = f_mid;
      }
    }
    const pO2 = 0.5 * (lo + hi);
    const sO2_val = sO2(pO2);
  
    return { pO2: pO2, sO2: sO2_val };
  }
  
  // Example usage:
  const result = calcBloodGas(7.35, 45, 37, 5, 8.5, 9.0);
  console.log(`pO₂ ≃ ${result.pO2.toFixed(1)} mmHg`);   // e.g. “pO₂ ≃ 52.3 mmHg”
  console.log(`SaO₂ ≃ ${(result.sO2*100).toFixed(1)} %`); // e.g. “SaO₂ ≃ 82.7 %”
  
  /*
  Is there a different p50 of the oxygen dissociation curve for fetal hemoglobin compared to adult hemoglobin?

  Response ChatGPT

  Thought for a couple of seconds


Yes—fetal hemoglobin (Hb F) has a markedly higher O₂ affinity than adult hemoglobin (Hb A), which shows up as a lower P₅₀ on the O₂-dissociation curve:

* **Adult Hb (Hb A)**

  * P₅₀ ≈ 26–27 mmHg under standard conditions (pH 7.4, 37 °C, normal 2,3-BPG)

* **Fetal Hb (Hb F)**

  * P₅₀ ≈ 19–20 mmHg under the same conditions

That \~6–8 mmHg left shift means at any given pO₂, Hb F is more saturated than Hb A.  Physiologically this lets the fetal blood “grab” O₂ from maternal blood across the placenta.

**Why the shift?**

* The γ-chains of Hb F bind 2,3-BPG less well than the β-chains of Hb A.
* Because 2,3-BPG stabilizes the low-affinity (T) state of Hb, less binding favors the high-affinity (R) state, lowering P₅₀.

You can see this left-shifted curve clearly plotted in any standard hematology or physiology text.


  */
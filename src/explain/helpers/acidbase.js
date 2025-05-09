/**
 * Solve for pH and pCO2 given strong ions, weak acids and total co2 concentration.
 *
 * Uses Newton-Raphson on [H+] with an analytic derivative.
 * 
 * @param {number} tco2         total co2 concentration (mmol/L)
 * @param {number} na           sodium concentration (mmol/L)
 * @param {number} k            potassium concentration (mmol/L)
 * @param {number} ionized ca2  calcium concentration (mmol/L)
 * @param {number} mg2          magnesium concentration (mmol/L)
 * @param {number} cl           chloride concentration (mmol/L)
 * @param {number} lactate      lactate concentration (mmol/L)
 * @param {number} ua           unmeasured anions concentration (mmol/L)
 * @param {number} albumin      albumin concentration (mmol/L)
 * @param {number} phosphates   phosphates concentration (mmol/L)

 * @returns {{pH:number, pCO2:number}}
 */
function solveAcidBase(
    tco2,
    na = 140,
    k = 4.0,
    ca2 = 1.05,
    mg2 = 0.7,
    cl =102,
    lactate = 1.0,
    ua = 0.0,
    albumin = 40.0, 
    phosphate = 1.8) 
    {
        // define the constants
        const alpha = 0.0307
        const pK1 = 6.1
        const pK2 = 10.3
        const pKaA = 6.8
        const Kw = 1e-14
        const Ka   = 10 ** -pKaA;         // weak‐acid dissociation
        const Kc   = alpha * 10 ** -pK1;  // CO₂ hydration: [HCO₃⁻] = Kc·pCO₂ / [H⁺]
        const K3   = 10 ** -pK2;          // bicarbonate → carbonate
        const KcK3 = Kc * K3;
    
        // 2) Newton‐Raphson on H = [H⁺]
        let H     = 10 ** -7.4;  // initial guess ~ pH 7.4
        const tol = 1e-10;
        const max = 20;

        // calculate Strong ion difference (mmol/L) (SID)
        const SID = na + k + ca2 + mg2 - cl - lactate - ua
    
        for (let i = 0; i < max; i++) {
            const H2 = H * H;
            const H3 = H2 * H;
    

            // calculate Total nonvolatile weak‐acid (mmol/L) A_tot from albumin (g/L) and phosphate (mmol/l)
            const coeffH = 0.123 * albumin + 0.309 * phosphate;
            const constant = 0.631 * albumin + 0.469 * phosphate;
            const A_tot = -coeffH * Math.log10(H) - constant;

            // a) pCO₂ from mass‐balance: tco2 = pCO2·(α + Kc/H + KcK3/H²)
            const denom = alpha + Kc / H + KcK3 / H2;
            const pCO2  = tco2 / denom;
    
            // b) electroneutrality residual: f(H) = SID + H - (OH + A⁻ + HCO₃⁻ + 2CO₃²⁻)
            const OH    = Kw / H;
            const Aneg  = A_tot * H / (Ka + H);
            const HCO3  = Kc * pCO2 / H;
            const CO3   = K3 * HCO3 / H;
            const f     = SID + H - (OH + Aneg + HCO3 + 2 * CO3);
    
            if (Math.abs(f) < tol) break;
    
            // c) analytic derivative f′(H)
            //    pCO2′ = -tco2 · (d(denom)/dH) / denom²
            const dDenom = -Kc / H2 - 2 * KcK3 / H3;
            const dpCO2  = -tco2 * dDenom / (denom * denom);
        
            const dOH    = -Kw / H2;                            // d/dH(Kw/H)
            const dAneg  = A_tot * Ka / ((Ka + H) * (Ka + H));  // d/dH(H/(Ka+H))
            const dHCO3  = Kc * (dpCO2 * H - pCO2) / H2;        // product + quotient
            const dCO3   = K3 * (dHCO3 * H - HCO3) / H2;        // same pattern
        
            // f′ = 1 - [dOH + dAneg + dHCO3 + 2·dCO3]
            const df = 1 - (dOH + dAneg + dHCO3 + 2 * dCO3);
    
            // Newton update
            H -= f / df;
        }
    
        // 3) Back-transform
        const pH   = -Math.log10(H);
        const pCO2 = tco2 / (alpha + Kc / H + KcK3 / (H * H));
    
        return { pH, pCO2 };
    }


    /* 
    */

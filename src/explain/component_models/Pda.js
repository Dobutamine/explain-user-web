import { BaseModelClass } from "../base_models/BaseModelClass";

/*
Anatomy & Embryology

    The ductus arteriosus is a short, conical vessel arising from the distal portion of the left sixth aortic arch. 
    It connects the roof of the pulmonary trunk (just downstream of the pulmonary valve) to the descending aorta 
    immediately distal to the left subclavian artery.

    Histologically, its wall contains a high proportion of smooth muscle cells arranged circumferentially, 
    making it exquisitely sensitive to oxygen tension and vasoactive mediators. 
    
     General Shape

    Conical/funnel-shaped: widest at the aortic (ampullary) end, tapering toward the pulmonary end.

    Anatomic variants (when patent beyond birth) are classified angiographically as:

        Type A (conical) – classic funnel

        Type B (window) – short, wide

        Type C (tubular) – nearly uniform diameter

        Type D (complex) – multiple constrictions

        Type E (elongated) – long, narrow funnel

    Its length is typically 2–3 cm, and its shape is conical—wider at the aortic end and tapering toward the pulmonary end 
    Diameter growth: follows ≈ 0.0935 mm/week (y = 0.2072 + 0.0935·x)
    Length growth: follows ≈ 0.4381 mm/week (y = –3.0726 + 0.4381·x)

    . Term Neonate

    Diameter: ~2–4 mm (approximating the descending aorta at the same level)

    Length: ~20–30 mm (2–3 cm)
    ncbi.nlm.nih.gov
    sciencedirect.com
    .

    Ampullary height (at aortic end) often 4–6 mm and may be measured midway for device selection.

    References

    StatPearls: “Patent Ductus Arteriosus” – conical shape, neonatal dimensions.
    ncbi.nlm.nih.gov

    Szpinda M. Morphometric study of the ductus arteriosus… 2007 – fetal diameter/length data.
    pubmed.ncbi.nlm.nih.gov

    ScienceDirect Topics: “Ductus Arteriosus” – comparison to descending aorta.
    sciencedirect.com

    Closure of the ductus arteriosus always begins at its pulmonary arterial end and proceeds toward the aortic end. This pattern reflects both the vessel’s anatomy and the localized responses to postnatal physiologic changes:

    Anatomic Basis
    The ductus arteriosus is conical, with a smaller diameter at its connection to the pulmonary artery and a wider “ampulla” at the aortic end. The thinner wall and smaller lumen at the pulmonary end allow it to constrict more rapidly when exposed to higher oxygen tensions.

    Physiologic Triggers
    With the first breaths:

        Arterial PO₂ rises abruptly in the pulmonary circulation, directly stimulating smooth-muscle constriction most strongly where oxygen levels increase first—i.e., at the pulmonary junction.

        Prostaglandin E₂ levels fall, removing vasodilatory support; again, the effect is first manifest where flow and receptor density are highest, at the pulmonary end.

    Clinical Correlation
    Even when closure is incomplete (as in a patent ductus arteriosus), angiographic studies routinely demonstrate a residual “aortic ampulla”—the portion near the aorta—while the pulmonary end is already sealed off
    pmc.ncbi.nlm.nih.gov
    .

    Thus, functional obliteration of the lumen begins at the pulmonary end and then—and only then—propagates 
    up toward the aortic ampulla.

    Elastance 

    Passive elastance is measured by slowly changing lumen pressure 
    (e.g., via perfusion of isolated vessel) and recording pressure–diameter (or volume) 
    curves in a calcium‐free bath to eliminate muscle tone.

    Active elastance reflects the additional stiffening when smooth‐muscle cells contract 
    (e.g., in response to O₂ or endothelin-1) and is determined by the shift in the P–V curve under 
    normal physiologic conditions compared to calcium‐free conditions.

    High SM content, low elastin ratio: Compared with the aorta, the ductus media has relatively 
    more smooth-muscle and fewer elastic lamellae, so its passive elastance at baseline is higher (i.e., compliance lower), 
    especially in late gestation when elastic fibers remain sparse and the intima thickens with “cushions”

    Active component dominates fetal patency: continuous prostaglandin E₂ keeps SM relaxed (low active EE); postnatally, 
    oxygen‐induced SM contraction sharply increases active EE.

     Dynamic Changes During Closure

    Fetal (Patent) Phase: Low active EE (high compliance) due to PGE₂-mediated SM relaxation.

    Functional Closure (12–24 h): Oxygen rise & PGE₂ fall trigger SM contraction → active EE ↑ dramatically.
    The shift in the P–V curve can increase total elastance by an order of magnitude.

    Anatomic Remodeling (2–3 weeks): Fibrosis and intimal cushion coalescence eliminate lumen; passive elastance 
    becomes effectively infinite (zero compliance).

    Clinical Implications

    Delayed closure (preterms): attenuated rise in active EE → persistent patency.

    Pharmacologic closure: NSAIDs raise active EE by lowering PGE₂.

    Post-closure instability: infants with the greatest jump in EAEA​ & EESEES​ are at higher risk of hypotension and low cardiac output

    In summary, the ductus arteriosus exhibits relatively high baseline elastance (low compliance) due to its smooth-muscle–rich wall, 
    but in utero its active elastance is held low by prostaglandins. At birth, rapid SM constriction sharply increases 
    active elastance, functionally sealing the lumen, after which fibrotic remodeling renders the vessel non-compliant.


*/
export class Pda extends BaseModelClass {
  // static properties
  static model_type = "Pda";
  static model_interface = [
    {    
      target: "model_type",  
      type: "string",
      build_prop: false,
      edit_mode: "basic",
      readonly: true,
      caption: "model type",
    },
    {
      target: "description",
      type: "string",
      build_prop: true,
      edit_mode: "basic",
      readonly: true,
      caption: "description",
    },
    {
      target: "is_enabled",
      type: "boolean",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "enabled",
    },
    {
      caption: "ductus diameter aortic ampulla (mm)",
      target: "diameter_ao",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus diameter pulmonary end (mm)",
      target: "diameter_pa",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus length (mm)",
      target: "length",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus elastance min",
      target: "el_min",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus elastance max",
      target: "el_max",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    }
  ];

  /*
    The Shunts class calculates the resistances of the shunts (ductus arteriosus, foramen ovale, and ventricular septal defect) from the diameter and length.
    It sets the resistances on the correct models representing the shunts.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // initialize independent properties
    // -----------------------------------------------

    this.diameter_ao = 4.0; // diameter at aortic origen (mm)
    this.diameter_pa = 2.0; // diameter at pulmonary artery (mm)
    this.diameter_max = 5.0; // maximum diameter of the ductus arteriosus (mm)
    this.length = 20; // length (mm)
    this.type = "conical"; // type of the ductal shape (conical, window, tubular, complex, elongated)
    this.el_min = 30000; // elasticity when open (mmHg/L) so both 5.0 mm
    this.el_max = 150000; // elasticity when closed (mmHg/L) so both 0.0 mm
    this.viscosity = 6; // viscosity of the blood (cP)

    // -----------------------------------------------
    // initialize dependent properties
    // -----------------------------------------------
    this.flow = 0; // blood flow (L/s)
    this.vol = 0; // volume of the duct  (a cone shaped duct of 2-4-20 has 0.000146 L)
    this.velocity = 0; // blood flow velocity (m/s)
    this.flow_ao = 0; // blood flow at the aortic origin (L/s)
    this.flow_pa = 0; // blood flow at the pulmonary artery (L/s)
    this.velocity_ao = 0; // blood flow velocity at the aortic origin (m/s)
    this.velocity_pa = 0; // blood flow velocity at the pulmonary artery (m/s)
    this.res_ao = 1500; // resistance at the aortic origen (mmHg*s/L)
    this.res_pa = 1500; // resistance at the pulmonary artery (mmHg*s/L)
    this.el = 40000; // current elastance (mmHg/L)
 
    // -----------------------------------------------
    // initialize local properties (preceded with _)
    // -----------------------------------------------
    this._da = {}
    this._aar_da = {}
    this._da_pa = {}
  }

  calc_model() {
    // get a reference to the ductus arteriosus blood vessel model
    this._aar_da = this._model_engine.models["AAR_DA"]; // BloodResistor
    this._da = this._model_engine.models["DA"]; // BloodCapacitance
    this._da_pa = this._model_engine.models["DA_PA"]; // BloodResistor

    // get the current flows
    this.flow_ao = this._aar_da.flow;
    this.flow_pa = this._da_pa.flow;

    // get the viscosity of the ductus arteriosus
    this.viscosity = this._da.viscosity

    // set the elastance of the ductus arteriosus
    this._da.el_base = this.el_min

    // guard for a too large ductal diameter
    this.diameter_ao = Math.min(this.diameter_ao, this.diameter_max);
    this.diameter_pa = Math.min(this.diameter_pa, this.diameter_max);

    // if the diameter is zero, set the resistance to a very high value to represent no flow
    this._aar_da.no_flow = this.diameter_ao === 0;
    this._da_pa.no_flow = this.diameter_pa === 0;

    // calculate the resistance across the ductus arteriosus
    this.res_ao = this.calc_resistance(this.diameter_ao, this.length / 2.0, this.viscosity)
    this.res_pa = this.calc_resistance(this.diameter_pa, this.length / 2.0, this.viscosity)
    
    // transfer the resistance to the ductus arteriosus
    this._aar_da.r_for = this.res_ao;
    this._aar_da.r_back = this.res_ao;

    this._da_pa.r_for = this.res_pa;
    this._da_pa.r_back = this.res_pa;

    // calculate the elastance of the duct depending on the diameter
    this.el = this.el_min + (this.el_max - this.el_min) * (this.diameter_pa / this.diameter_max);

    // calculate the ductus arteriosus area
    let area_ao = Math.pow((this.diameter_ao * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    let area_pa = Math.pow((this.diameter_pa * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    
    // calculate the velocity across the ductus arteriosus
    this.velocity_ao = area_ao > 0 ? (this.flow_ao * 0.001) / area_ao : 0.0;
    this.velocity_pa = area_pa > 0 ? (this.flow_pa * 0.001) / area_pa : 0.0;

    // calculate the volume of the ductus arteriosus
    this.vol = this._da.vol

  }

  set_diameter(new_diameter) {
    this.diameter_ao = new_diameter;
    this.diameter_pa = new_diameter;
  }

  calc_closure() {}

  calc_resistance(diameter, length = 20.0, viscosity = 6.0) {
    if (diameter > 0.0 && length > 0.0) {
      // resistance is calculated using Poiseuille's Law: R = (8 * n * L) / (PI * r^4)
      // diameter (mm), length (mm), viscosity (cP)

      // convert viscosity from centiPoise to Pa * s
      const n_pas = viscosity / 1000.0;

      // convert the length to meters
      const length_meters = length / 1000.0;

      // calculate radius in meters
      const radius_meters = diameter / 2 / 1000.0;

      // calculate the resistance Pa * s / m^3
      let res =
        (8.0 * n_pas * length_meters) / (Math.PI * Math.pow(radius_meters, 4));

      // convert resistance from Pa * s / m^3 to mmHg * s / L
      res = res * 0.00000750062;
      return res;
    } else {
      return 100000000; // a very high resistance to represent no flow
    }
  }
}

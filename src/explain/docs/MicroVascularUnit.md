# MicroVascularUnit

A MicroVascularUnit (MVU) models a functional capillary unit: the terminal arteriole, the capillary network branching from it, and the collecting venule. It is the fundamental exchange site in the circulatory system where gas exchange, nutrient delivery, and waste removal occur at the tissue level.

## Inheritance

```
BaseModelClass
  └── MicroVascularUnit    (composed of 3 BloodVessel sub-components)
```

Note: MVU extends `BaseModelClass` directly, not `Capacitance` or `BloodVessel`. It is a composite model that creates and manages three `BloodVessel` instances internally.

## What it models

An MVU represents a complete microvascular bed as a single configurable unit. Internally it consists of three `BloodVessel` components connected in series:

```
[upstream] → ART (arteriole) → CAP (capillary) → VEN (venule) → [downstream]
```

The MVU defines total values for volume, elastance, resistance, etc., and distributes them across the three sub-components using configurable distribution ratios. This allows a single JSON definition to represent the entire microvascular bed while still capturing the different mechanical properties of arterioles, capillaries, and venules.

## Initialization

During `init_model()`, the MVU creates three `BloodVessel` instances named `{MVU_NAME}_ART`, `{MVU_NAME}_CAP`, and `{MVU_NAME}_VEN`. Each is registered in the model engine and marked `is_externally_managed = true`.

The MVU's total properties are distributed to sub-components at initialization:
- **Volume**: distributed by `vol_dist` (e.g., 10% arteriole, 55% capillary, 35% venule)
- **Resistance**: distributed by `res_dist` (e.g., 75% arteriole, 15% capillary, 10% venule)
- **Elastance**: distributed by `el_dist` using an inverse-compliance formula (see below)

If components already exist in the model engine (e.g., when loading from a saved state), the existing instances are reused.

## Properties

### Base properties (from definition JSON)

| Property | Unit | Description |
|---|---|---|
| `u_vol` | L | Total unstressed volume of the MVU |
| `el_base` | mmHg/L | Total elastance of the MVU |
| `el_k` | unitless | Non-linear elastance coefficient |
| `r_for` | mmHg·s/L | Total forward resistance |
| `r_back` | mmHg·s/L | Total backward resistance |
| `r_k` | unitless | Non-linear resistance coefficient |
| `inputs` | string[] | Upstream components (connected to the ART sub-component) |
| `ans_sens` | 0-1 | Overall ANS sensitivity of the MVU |
| `no_flow` | boolean | Block all flow |
| `no_back_flow` | boolean | Block backward flow |

### Distribution objects

| Property | Description | Typical values |
|---|---|---|
| `vol_dist` | Volume distribution `{ art, cap, ven }` | `{ art: 0.10, cap: 0.55, ven: 0.35 }` |
| `res_dist` | Resistance distribution `{ art, cap, ven }` | `{ art: 0.75, cap: 0.15, ven: 0.10 }` |
| `el_dist` | Elastance distribution `{ art, cap, ven }` | `{ art: 0.10, cap: 0.15, ven: 0.75 }` |

### ANS configuration

| Property | Description | Typical values |
|---|---|---|
| `ans_sens_settings` | Per-component ANS sensitivity `{ art, cap, ven }` | `{ art: 1.0, cap: 0.0, ven: 0.75 }` |
| `alpha_settings` | Per-component resistance-elastance coupling `{ art, cap, ven }` | `{ art: 0.63, cap: 0.0, ven: 0.75 }` |

### Blood composition

| Property | Unit | Description |
|---|---|---|
| `temp` | degC | Blood temperature (read from capillary component) |
| `viscosity` | cP | Blood viscosity |
| `to2` | mmol/L | Total oxygen concentration |
| `tco2` | mmol/L | Total carbon dioxide concentration |
| `ph`, `pco2`, `po2`, `so2`, `hco3`, `be` | various | Blood gas values (read from capillary component) |
| `solutes` | object | Solute concentrations (from capillary) |
| `drugs` | object | Drug concentrations (from capillary) |

### Dependent properties

| Property | Unit | Description |
|---|---|---|
| `vol` | L | Total volume (sum of art + cap + ven) |
| `pres` | mmHg | Capillary pressure |
| `pres_in` | mmHg | Arteriolar pressure |
| `pres_out` | mmHg | Venular pressure |
| `flow` | L/s | Capillary flow |
| `flow_in` | L/s | Arteriolar flow |
| `flow_out` | L/s | Venular flow |

### Calculated intermediates

| Property | Unit | Description |
|---|---|---|
| `r_for_eff` | mmHg·s/L | Effective total forward resistance |
| `r_back_eff` | mmHg·s/L | Effective total backward resistance |
| `r_k_eff` | unitless | Effective non-linear resistance coefficient |
| `el_eff` | mmHg/L | Effective total elastance |
| `el_k_eff` | unitless | Effective non-linear elastance coefficient |
| `u_vol_eff` | L | Effective total unstressed volume |
| `r_for_art/cap/ven` | mmHg·s/L | Distributed forward resistance per component |
| `r_back_art/cap/ven` | mmHg·s/L | Distributed backward resistance per component |
| `el_art/cap/ven` | mmHg/L | Distributed elastance per component |
| `u_vol_art/cap/ven` | L | Distributed unstressed volume per component |

## Three-tier factor system

The MVU has its own set of factors (independent of the sub-components, which have their factors reset to 1.0 due to `is_externally_managed`):

| Tier | Factors | Purpose |
|---|---|---|
| Non-persistent | `u_vol_factor`, `el_base_factor`, `el_k_factor`, `r_factor`, `r_k_factor` | Transient effects, reset each step |
| Persistent (`_ps`) | `u_vol_factor_ps`, `el_base_factor_ps`, `el_k_factor_ps`, `r_factor_ps`, `r_k_factor_ps` | Ongoing physiological modulation |
| Scaling (`_scaling`) | `u_vol_factor_scaling`, `el_base_factor_scaling`, `el_k_factor_scaling`, `r_factor_scaling`, `r_k_factor_scaling` | ModelScaler weight/manual scaling |

## Calculation cycle (`calc_model`)

1. **Enable/disable** all sub-components based on `is_enabled`
2. **ANS modulation**: compute effective ANS activity scaled by `ans_sens`, pass to sub-components along with per-component `ans_sens_settings`
3. **`calc_resistance()`** -- compute total effective resistance, distribute to art/cap/ven by `res_dist`
4. **`calc_elastance()`** -- compute total effective elastance, distribute to art/cap/ven by `el_dist` using inverse-compliance formula
5. **`calc_volume()`** -- compute total effective unstressed volume, distribute to art/cap/ven by `vol_dist`
6. **Push to sub-components** -- set `el_base`, `r_for`, `r_back`, `u_vol`, etc. on each BloodVessel
8. **Read from sub-components** -- collect pressures, flows, total volume, and blood composition from the capillary component

## Elastance distribution formula

Elastance is distributed using an inverse-compliance model. The three sub-components are in series (from a compliance perspective), so their compliances add:

```
1/el_total = 1/el_art + 1/el_cap + 1/el_ven
```

The distribution percentages in `el_dist` control what fraction of the total inverse-elastance each component contributes:

```
unit = 1 / (3 * el_base) / 33.3333

el_art = 1 / (el_dist.art * 100 * unit)
el_cap = 1 / (el_dist.cap * 100 * unit)
el_ven = 1 / (el_dist.ven * 100 * unit)
```

With default `el_dist = { art: 0.10, cap: 0.15, ven: 0.75 }`, the venule gets 75% of the compliance (lowest elastance = most compliant), and the arteriole gets 10% (highest elastance = stiffest). This reflects the physiological reality that venules are much more compliant than arterioles.

## ANS coupling

The MVU applies ANS at two levels:

1. **MVU level**: `ans_activity` is modulated by `ans_sens` to produce an effective ANS activity:
   ```
   _ans_activity = 1.0 + (ans_activity - 1.0) * ans_sens
   ```

2. **Component level**: Each sub-component has its own `ans_sens` (from `ans_sens_settings`) and `alpha` (from `alpha_settings`). The arteriole is typically the most ANS-responsive for resistance, while the venule contributes more to volume changes.

The sub-components are `BloodVessel` instances with full alpha-coupling, so ANS-driven resistance changes in the arteriole also affect its elastance (see BloodVessel documentation).

## Example definition (JSON)

```json
{
  "name": "BR",
  "description": "brain microvascular unit",
  "model_type": "MicroVascularUnit",
  "is_enabled": true,
  "vol": 0.0125,
  "u_vol": 0.012,
  "el_base": 7500,
  "el_k": 0,
  "r_for": 19500,
  "r_back": 19500,
  "r_k": 0,
  "inputs": ["AD2"],
  "ans_sens": 0.0,
  "no_flow": false,
  "no_back_flow": false
}
```

## Instances in the model

Typical MVU instances represent organ-specific capillary beds:

| Name | Description | Inputs |
|---|---|---|
| `BR` | Brain | `AD2` (descending aorta) |
| `UB` | Upper body | `AD1` (descending aorta) |
| `LB` | Lower body | `AD2` (descending aorta) |
| `KID` | Kidneys | `AD2` (descending aorta) |
| `INT` | Intestines | `AD2` (descending aorta) |
| `LS` | Left lung shunt | `PA` (pulmonary artery) |

Each MVU creates three sub-models (e.g., `BR_ART`, `BR_CAP`, `BR_VEN`) that are visible in the model engine.

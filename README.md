# Dialyzer Lab

English-language static research application, version 0.2.0. Live site: https://apm1199.github.io/dialyzer-lab/ . Source: https://github.com/apm1199/dialyzer-lab . GitHub Pages serves `main` / `docs`.

Open `docs/index.html` directly or serve `docs/` over HTTP. No installation, external services or analytics are required. CSV files are processed locally in the browser.

## What changed in 0.2

- Entire website, validation messages and documentation are in English.
- Both paper presets cover Qd = 0 to 133.33 mL/min, with explicit zero-flow handling.
- The paper's full Dapp correlation now drives the reduced model, replacing the former four-point direct KoA interpolation for paper presets.
- Water adds the 17.5 mL/min clearance reference. The rounded 5 mL/min CFD result is a separate check, not a fitted point.
- Blood below 41.67 mL/min is labelled as an unvalidated reduced-model prediction.
- Imported datasets retain direct KoA interpolation within their positive measured range.

## Source data and full paper correlation

Source: user-supplied `Paper_APM - draft.pdf`, Sections 2.7 and 3.2, Table 4 and Appendix C. PDFs are not redistributed here.

| Qd (mL/min) | Dapp (m2/s) | Role |
|---|---|---|
| 0 | 0 | Imposed correlation boundary, not a measurement |
| 5 | 7.866723070416e-12 | Paper correlation prediction |
| 17.5 | 4.326898176908e-11 | Identified node |
| 41.67 | 1.8326875e-10 | Identified node |
| 66.67 | 2.56355e-10 | Identified node |
| 100 | 2.958149200032e-10 | Paper correlation prediction |
| 133.33 | 3.250668012693e-10 | Identified node |

Use the five nodes at 0, 17.5, 41.67, 66.67 and 133.33 in a cubic Hermite interpolant. Derivatives follow shape-preserving PCHIP except for the final derivative, replaced by the final interval's secant slope, exactly as in Appendix C. The exponential continuation above 133.33 is not used in this application. No flow extrapolation beyond 133.33 is enabled.

The same Dapp is used for water and blood. Dapp is an effective calibrated transport coefficient, not an independently measured intrinsic membrane diffusivity. Dapp(0)=0 is phenomenological.

## Reduction to a rapid clearance model

The site does not run the OpenFOAM solvers. It uses the paper correlation inside an equivalent countercurrent-exchanger model. This reduction has its own assumptions and must not inherit the original CFD validation automatically.

Geometry constants from Appendix C:

    ri = 1.076024136551e-4 m
    ro = 1.576500479132e-4 m
    L = 0.218 m; N = 7500
    lc = ri*log(ro/ri) = 4.109708596949e-5 m
    A = 2*pi*ri*L*N = 1.1054004538489726 m2

At each positive reference point, invert the exchanger relation to obtain KoA_reference. Then identify a dimensionless equivalent factor:

    eta_i = KoA_reference_i / (A*Dapp_i/lc)
    KoA(Qd) = eta(Qd)*A*Dapp(Qd)/lc

Use consistent SI flow units for this identification; the interface reports KoA in mL/min. Eta uses PCHIP between reference conditions. Below the first positive reference it is held constant: below 17.5 for water and below 41.67 for blood. This is a new reduced-model continuation assumption, not a new CFD or experimental result.

Eta represents the combined effective response of unresolved fluid-side transfer and internal convective exchange. It can exceed one (about 1.0234 at the first water node). Do not interpret it as a physical film coefficient, a probability, or an intrinsic membrane property. No extra convective clearance is added, because the reference response already contains internal convection at zero net UF.

| Qd (mL/min) | Water reference K (mL/min) | Blood CFD K, aqueous reference (mL/min) |
|---|---|---|
| 17.5 | 17 | Not used / unavailable here |
| 41.67 | 41 | 40.47 |
| 66.67 | 62 | 58.71 |
| 100 | 78 | 71.01 |
| 133.33 | 88 | 76.53 |

Water 17, 41, 62 and 88 are identification targets; 78 is a comparison reference, not a manufacturer specification. Blood values are CFD predictions, not blood experiments. The water CFD result at 5 is only reported approximately as 4.66 in Section 3.2; the reduced model predicts about 4.596 without fitting this check. This roughly 1.4% model-to-model difference is not an experimental error estimate.

## Exchanger equation

For Qd > 0:

    Qmin = min(Qw,Qd); Qmax = max(Qw,Qd)
    Cr = Qmin/Qmax; NTU = KoA/Qmin
    effectiveness = (1-exp(-NTU*(1-Cr))) / (1-Cr*exp(-NTU*(1-Cr)))
    Kwater = Qmin*effectiveness

For equal aqueous and dialysate flows Q, use Kwater = Q*KoA/(Q+KoA). The implementation uses expm1 for numerical stability.

For Qd = 0, Kwater = 0, removal = 0, feed outlet concentration equals inlet concentration, and dialysate effluent concentration is null / N/A. KoA tends to zero through the imposed effective Dapp correlation. This does not mean the physical membrane has zero molecular diffusivity. It is a steady CVVHD zero-net-UF limit, not a hemofiltration calculation. It does not model transient uptake into a stagnant dialysate compartment.

## Blood and concentration balances

All presets have Qb = 100 mL/min and zero net UF. Water has fw = 1. Blood uses Hct = .35, plasma water .93, erythrocyte water .72, hence fw = .8565. Rapid urea equilibration between the two aqueous compartments is assumed. The paper's blood response uses Carreau-Yasuda rheology, but this application does not solve a viscosity/shear-rate field.

The interface inlet concentration is kg/m3 of total feed fluid:

    Qw = fw*Qb; Cw,in = Cbulk,in/fw
    removal = Kwater*Cw,in
    Cw,out = Cw,in*(1-Kwater/Qw)
    Cbulk,out = fw*Cw,out
    Cd,out = Kwater*Cw,in/Qd             [only Qd > 0]
    Kbulk = Kwater/fw

K in mL/min times C in kg/m3 gives the numerical removal rate in mg/min. Solute-free dialysate is assumed. In this linear model concentration scales removal and outlet concentrations but not clearance.

## CSV import and checks

Steady CSV: `qd_mlmin,clearance_water_mlmin`, with optional `qb_mlmin,uf_net_mlmin`. Supply at least two unique positive flows with 0 < K < min(Qw,Qd). Declare fluid, Qb and fw. Aggregate replicates before import; do not mix filters, solutes or operating conditions in one dataset. A comma delimiter with decimal points or a semicolon delimiter with decimal commas is supported. Text/quoted multiline fields are not supported.

Imported data use direct PCHIP interpolation of the inverse exchanger KoA. They do not inherit the paper correlation or its 0–133.33 range. Nonzero net UF is rejected.

Reference-node reconstruction is a fitting check, not validation. Interior leave-one-out checks remove one clearance reference and refit the equivalent mapping while retaining the already identified Dapp. Endpoints are not held out. This does not independently validate Dapp or establish parameter-transfer accuracy.

## Dynamic identification

    G(s) = deltaY(s)/deltaU(s) = g*exp(-theta*s)/(tau*s+1)

Time CSV: `time_s,input,output`; strictly increasing time, one step followed by a constant input, at least 3 pre-step and 10 post-step points, at least 16 total. Baseline is the pre-step mean; step time is the first changed input sample. Delay resolution is limited by sampling.

The first 70% of post-step samples fits the gain, time constant and delay via a grid search and amplitude regression. The final tail is held out. No confidence intervals or identifiability tests are supplied. A small RMSE from an insufficiently long response does not prove reliable parameters. Verify with a separate experiment.

For Cin -> Cout at constant flows the gain has concentration/concentration units; it is not clearance. For Qd -> Cout the transfer function is local to an operating point. Recirculating-reservoir dynamics cannot be assigned to the filter alone. The synthetic demo (g=.6, tau=30 s, delay=6 s) is not experimental. No dynamic parameters have been identified from the PDFs.

## Membrane conversions and limits

The separate membrane panel computes k_Darcy = Lp*mu*delta, Deff = Dbulk*porosity/tortuosity and the planar membrane-only conductance A*Deff/delta. These fields do not change the preset clearance. Hindrance and partition are assumed unity in this conversion.

Geometry, Qb, fluid properties and net UF remain fixed per dataset. The application does not predict local Jv, shear or pressure fields, evolving water fraction, fouling, adsorption or performance in other therapeutic modes. A coupled physical reduction or additional data is required for those dependencies. Blood below 41.67 is a model continuation, not validated blood performance.

## Development and tests

Run `npm test`; no dependencies need installing. `docs/model.js` is the pure numerical engine; `docs/app.js` controls the interface. Tests cover the exact paper coefficients, physical bounds, conservation, zero flow, reference reconstruction, interpolation, CSV handling, full-domain monotonicity and synthetic dynamic identification. They are numerical checks, not experimental validation.

The MATLAB version should later implement the same equations and reference tests. The earlier uniform-UF MATLAB prototype is separate and does not power this site.

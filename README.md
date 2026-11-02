# Dialyzer Lab

English static research app for the Baxter Prismaflex HF1000 urea reference response and reference-normalised membrane design exploration. Published from `docs/` with GitHub Pages. Developed by Antonio Pio Mantovan; experimental validation activities in collaboration with Hematica. Logo is the unchanged symbol supplied by the user. Public contacts are included in the page footer.

## Run and verify

Serve `docs/` with any static server. No build dependencies. Run `node --test tests/*.cjs` for the reference model, conservation, physical limits, property sensitivity and axial-refinement checks.

## Reference model

`docs/model.js` uses a shape-preserving effective-diffusivity correlation on 0–133.33 mL/min. Fluid-specific equivalent factors are identified by inversion of the countercurrent exchanger relation, then interpolated. The zero-flow limit is imposed; low-flow blood predictions lack validation data. Imported CSV datasets use their own direct KoA interpolation. Dataset-node reproduction and leave-one-out checks are implementation/internal checks, not independent experimental validation.

## Membrane design explorer

`docs/design.js` solves approximate steady 1D coupled hydraulics and conservative solute transport with 100 axial cells. Geometry sets inner area, cylindrical membrane length, equivalent fibre count and dialysate annulus. Material diffusion uses Dbulk × porosity × hindrance / tortuosity. Intrinsic permeability is either supplied or derived from Lp × pore viscosity × thickness (all converted to SI). Cylindrical Darcy flow and Poiseuille pressure losses generate local filtration/backfiltration with equal feed inlet/outlet flow, hence zero net UF.

Blood uses a constant viscosity or a nominal-wall-shear Carreau–Yasuda approximation. Default constants: mu0=0.0225 Pa s, muInf=0.0022 Pa s, lambda=0.11 s, n=0.392, a=0.644; Hct=0.35 and plasma/RBC water fractions 0.93/0.72. These are model assumptions, not new fitted measurements. Film Sherwood defaults are 3.66; the annular and blood closures are simplified and adjustable.

A retained reference resistance Radd=lc_ref(1/Dapp_ref−1/Deff_ref) accounts for unresolved effective transport. Membrane resistance becomes lc_new/Deff_new+Radd; fluid film resistances are added in series. The integrated convection–diffusion flux uses the stable Bernoulli function B(z)=z/expm1(z), with freely sieved urea. Axial finite-volume balances include upwind advection and molecular diffusion, including internal dialysate reversal. Adsorption, fouling and oncotic pressure are omitted.

Raw 1D clearances are inverted into equivalent KoA values. The ratio KoA_1D,new/KoA_1D,ref scales the calibrated reference KoA before conversion to final clearance and global outlet concentrations. Identical reference properties reproduce the reference curve by construction. This is calibration preservation, not validation of new membrane geometries or operating conditions. Raw solver profiles in JSON are diagnostics and are not the final calibrated concentration profile.

The interface has Clearance and Model & method. Standard mode has seven primary physical inputs plus fluid selection; Research mode exposes advanced properties and a read-only Reference checks section. The legacy CSV interpolation engine remains available in model.js, but the user interface no longer fits imported clearances. No transient-model page is exposed because no transient measurements are available. Core legacy time-response utilities remain unused by the UI.

Theme: Prussian blue (#003153), white typography. White Hematica complete logo supplied by the official website, https://www.hematica.it/wp-content/uploads/2025/11/LogoWhiteComplete-768x263.png. DISAT address: Corso Duca degli Abruzzi 24, 10129 Torino; campus entrance Corso Castelfidardo 39.

## Extended flow inputs (0.5.0)

Scope: pristine hollow-fibre membranes, urea, CVVHD, zero net UF. The design engine accepts finite nonnegative Qd and positive feed flow, subject to solver admissibility. Beyond Qd=133.33 mL/min, the unresolved HF1000 resistance decays exponentially to zero. The scale is −Radd/Radd' at the endpoint, so both value and slope match the existing correlation. Effective diffusivity approaches the reference material diffusivity; eta is held constant at its endpoint. Both 1D solves use actual Qd, and the conductance ratio transfers geometry/material/flow sensitivity. No clearance or KoA from another dialyzer enters a prediction. Manufacturer clearances are external checks only.

The reference preset interpolation remains unchanged and rejects extrapolation. Extended conditions automatically enable the design model. Numeric flow input has no preset maximum; the slider starts at 1000 mL/min and expands if needed. Imported datasets retain measured-domain restrictions. This is an explicit continuation assumption, not universal predictive validity. Unknown membrane properties must remain labelled assumptions. Axial diffusion uses a shared face coefficient for both neighbouring cells, including changing aqueous fractions in blood, to conserve solute at high flow.

## Browser entry gate (0.6.0)

The entry page checks a SHA-256 password fingerprint in the browser and opens the entire calculator after a matching password. The supplied password is not stored verbatim in source. Model scripts load only after entry; sessionStorage retains access for the current tab up to eight hours. Sign out clears the local session. This intentionally matches the thesis master-page interaction. It is a browser UI gate, not server-side authorization: GitHub source/history and directly addressed static assets remain public. It must not be represented as a private hosting boundary. Robots directives request no indexing but do not enforce access control.

## Standard and Research interface (0.7.0)

The numerical engines model.js and design.js are unchanged. Standard inputs are Qb, Qd, area, fibre length, inner diameter, thickness and Lp plus fluid. Research mode exposes the remaining material/fluid/film/rheology/grid parameters. Switching modes preserves values; retained advanced overrides are declared. Inactive fluid/rheology fields are hidden, while the unused hydraulic input is disabled. Kwater and Kbulk are displayed together. Concentration, removal and local diagnostics are secondary outputs.

Manufacturer clearance is an optional post-prediction comparison in checks.js, with an explicit concentration basis and a user confirmation of matching conditions. It is never passed to the solver. The Validation subtab contains HF1000 calibration reconstruction and xevonta Hi18/Hi20/Hi23 manufacturer cross-checks at Qd=500 mL/min and Qb=200/300/400. Reference versus external cases, assumed properties and test-basis limitations are stated. No changes to the HF1000 calibration were made.

Version 0.7.1 labels water/blood inlet flow explicitly in Standard mode. Detailed membrane/module and film inputs remain editable in Research mode. Feed-side Sherwood is 4.36 and dialysate-side Sherwood 3.66. The HF1000 calibration data are unchanged; the reference-normalised 1D denominator uses the updated default feed closure. See the membrane and Sherwood audit for verification.

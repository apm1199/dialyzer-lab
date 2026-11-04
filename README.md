# Dialyzer Lab

English static research app for urea clearance and pristine-membrane design exploration. Developed from experimental data collected by Hematica during in-vitro CVVHD experiments. The reference test module is Baxter Prismaflex HF1000. Published from `docs/` with GitHub Pages. Developed by Antonio Pio Mantovan; experimental validation activities in collaboration with Hematica. Logo is the unchanged symbol supplied by the user. Public contacts are included in the page footer.

## Run and verify

Serve `docs/` with any static server. No build dependencies. Run `node --test tests/*.cjs` for the reference model, conservation, physical limits, property sensitivity and axial-refinement checks.

## Reference model

`docs/model.js` uses a shape-preserving effective-diffusivity correlation on 0–133.33 mL/min. Fluid-specific equivalent factors are identified by inversion of the countercurrent exchanger relation, then interpolated. The zero-flow limit is imposed; low-flow blood predictions lack validation data. Imported CSV datasets use their own direct KoA interpolation. Dataset-node reproduction and leave-one-out checks are implementation/internal checks, not independent experimental validation.

## Membrane design explorer

`docs/design.js` solves approximate steady 1D coupled hydraulics and conservative solute transport with 100 axial cells. Geometry sets inner area, cylindrical membrane length, equivalent fibre count and dialysate annulus. Material diffusion uses Dbulk × porosity × hindrance / tortuosity. Intrinsic permeability is either supplied or derived from Lp × pore viscosity × thickness (all converted to SI). Cylindrical Darcy flow and Poiseuille pressure losses generate local filtration/backfiltration with equal feed inlet/outlet flow, hence zero net UF.

Blood uses a constant viscosity or a nominal-wall-shear Carreau–Yasuda approximation. Default constants: mu0=0.0225 Pa s, muInf=0.0022 Pa s, lambda=0.11 s, n=0.392, a=0.644; Hct=0.35 and plasma/RBC water fractions 0.93/0.72. These are model assumptions, not new fitted measurements. Film Sherwood defaults are 4.36 (feed) and 3.66 (dialysate); the annular and blood closures are simplified and adjustable.

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

## Filter catalog, geometry and comparison figures (0.8.0)

`docs/catalog.js` holds 207 sourced device entries (189 selectable blood dialyzers and 18 unsupported special devices) extracted from the supplied manufacturer archive and compiled workbook. Application groups distinguish acute AKI/CRRT from chronic intermittent HD; the solver itself remains zero-net-UF CVVHD for every preset. Selecting a preset resets material/numerical assumptions to reference values and preserves inlet feed and dialysate flow and the selected fluid. Missing active fibre length is never replaced by housing length. Source filenames, pages and missing-property assumptions are displayed and exported. Lp derived from KUF/area is a device test coefficient, often measured using blood, and is not automatically an intrinsic pristine-water permeability.

Standard mode permits an explicit integer fibre count. Zero means derive count from area. With a specified count, the effective inner area is Nf*pi*di*L; the area field is computed. In Research mode, a positive internal module diameter sets rd=Rshell/sqrt(Nf), with packing inferred. At zero diameter, packing sets Rshell=ro*sqrt(Nf/packing); count alone does not determine annular spacing. All hydraulics and cell exchange areas use the consistent derived area.

Gross filtration fraction is sum(max(Jv_i*A_i,0))/Qb,in, using total blood/water inlet flow rather than plasma-water flow. It is displayed in percent alongside aqueous clearance; Kbulk remains under secondary results. Both clearance and gross fraction can be plotted against Qd. At Qd=0 the existing hydraulic solve is bypassed, so FF is unavailable rather than fabricated as zero.

Validation offers manufacturer comparison points at each documented Qd. Explicit nonzero-UF benchmark points are retained as provenance in the catalog but excluded from this zero-UF comparison. Missing QF is disclosed. White whiskers use documented manufacturer tolerances; red whiskers use a user-requested assumed +/-10% comparison band where none is supplied. None are statistical confidence intervals. Clearances and bounds never enter predicted filter properties or the solver.

Prediction and Validation figures can be downloaded as a standalone SVG or 2100x1410 PNG. Exports include filter identity, operating conditions, predicted curve, nominal manufacturer points, error bars and the distinction between assumed bands and reported tolerances. There are no chart-library, network or backend dependencies for image export.

The primary response chart uses a dashed marker at the currently selected Qd, rather than at the calibration endpoint. Its annotation and both image exports update with the selected dialysate flow. All public calibration attribution identifies Hematica in-vitro CVVHD experiments. HF1000 is retained only as a test module/filter identity, not as the supplier of calibration data.



## Protocol audit and two-filter comparison (0.9.0)

Validation now admits only documented aqueous, zero-net-UF urea tests for CVVHD-compatible devices: ST60/100/150 (11 points) and HCD015/025 (8). All 19 manufacturer tests use saline; the solver uses water properties, explicitly stated. Blood-test data and unknown clearance media are excluded. Blood references in KUF methods are never used to infer the clearance medium. Eligibility is independent of prediction error and ±10% display bands. ST curves vary Qd at fixed Qb, HCD curves vary Qb at fixed Qd. Each graph identifies physical inputs, assumed properties and sources. Internal reference reconstruction is separated under Research checks.

Only the 17 documented CVVHD presets are selectable; other entries remain catalog-identifiable. Custom research design inputs remain available. Blood mode is a numerical extension, while external validation always uses water.

Standard mode displays fibre count immediately. Estimates are labelled calculated, with assumed active length disclosed. A checkbox enables a measured/specified count and recomputes area consistently. The supplied workbook has Number of fibers headers but empty B.Braun/Baxter data cells. A separate reported-count table documents HF1000=7500/HF1400=9500 from Clark, Membranes for CRRT p.15 (data attributed to Baxter), and xevonta Hi18=11000 from Poorkhalil et al., DOI 10.1111/aor.13355, Table1. These are not relabelled as manufacturer datasheets or generalized to other variants. The Hi18 count is retained as literature information, not forced into geometry without confirming active length and nominal area consistency.

The main graph compares two model predictions under shared flow, fluid, film and numerical settings. A uses edited inputs; B retains its physical membrane preset and assumptions. White denotes A, red B. The adaptive Qd marker, both curves and identity labels are included in image exports; B inputs/results are included in JSON. Manufacturer clearance never enters this calculation.


## Availability correction (0.9.1)

Commercial HD/CRRT indications no longer disable physical presets. All189 blood-dialyzer catalog entries and the HF1000 reference can be selected for calculation and filter comparison under the software's CVVHD zero-net-UF conditions. Specialty water filters/plasma separators/adsorbers remain outside the urea model. This is numerical exploration, not a declaration of a device's clinical indication.

Manufacturer comparisons are a separate gate: only an explicitly documented saline urea-clearance test with QF=0 is admitted. KUF blood-test conditions are never assigned to the clearance test. Unknown medium remains unverified, without making the physical filter unavailable. Dataset eligibility does not depend on its commercial category, accuracy relative to a10% band, or the presence of a CVVHD label. HF1000 is now selectable as either filter A or B.

## Catalog and accuracy audit (0.9.2)

Medtronic and Nephros are removed from selection at the project owner's request. B. Braun, Fresenius and Nipro saline-clearance medium is recorded as owner-confirmed rather than misrepresented as explicit workbook evidence. Theranova aqueous zero-UF and ST saline zero-UF observations are available. Nonzero-UF and unknown-medium observations remain outside the validation selector. Eligibility never depends on prediction error. The validation page reports fixed ±10% coverage and links the complete CSV audit; run `node scripts/audit-clearances.cjs` to regenerate the main audit. The report includes an additional controlled comparison explaining the7,500-fibre question. Equations and coefficients are unchanged.

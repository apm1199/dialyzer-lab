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

The page has three sections: Clearance (including design controls), Your data, Model & method. No transient-model page is exposed because no transient measurements are available. Core legacy time-response utilities remain unused by the UI.

Theme: Prussian blue (#003153), white typography. White Hematica complete logo supplied by the official website, https://www.hematica.it/wp-content/uploads/2025/11/LogoWhiteComplete-768x263.png. DISAT address: Corso Duca degli Abruzzi 24, 10129 Torino; campus entrance Corso Castelfidardo 39.

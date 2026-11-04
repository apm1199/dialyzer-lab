# Filter catalog and geometry audit · 2026-11-04

Scope: urea, pristine hollow-fibre membranes, steady CVVHD with zero net UF.

## Provenance and coverage

The supplied archive `OneDrive_2026-11-04.zip` contains manufacturer brochures, IFUs, product images and the workbook `Filtri classificaione.xlsb`. The catalog includes 207 entries: 60 B. Braun/Baxter and 147 Nipro/Medtronic/Fresenius/Lepu/Nephros. Of these, 172 are chronic intermittent-HD devices, 17 acute AKI/CRRT devices and 18 special devices outside this model. Application categorization does not change the therapy simulated or establish clinical suitability.

Catalog entries retain filename/page references, declared physical properties, notes and benchmark provenance. Unknown active fibre length, porosity, packing, tortuosity or diffusivity is not inferred from clearance. Missing physical values retain reference model assumptions, explicitly displayed. B.Braun legacy xevonta Hi10/12 properties have a secondary-workbook-source warning. Model development is attributed to Hematica in-vitro CVVHD experimental data as specified by the project owner; reference coefficient arrays have not been refitted in this change.

## Important source distinctions

- Medtronic Clearum outer housing dimensions are not active fibre length or inner shell diameter.
- Baxter ST set dimensions are not active fibre length.
- Nipro effective fibre lengths are transcribed where supplied; inferred fibre counts follow inner exchange area divided by pi*di*L.
- Hydraulic Lp is KUF/effective area in mL/(h mmHg m2). Manufacturer KUF is often blood-test and flow dependent. It is not an independent pristine-water material measurement. HCD alternatives remain documented in notes.
- Water treatment ultrafilters, plasma separators, adsorbers and other incompatible devices cannot be selected for the urea dialyzer calculation.

## Comparison points and bounds

565 urea benchmark rows are stored. 104 carry documented manufacturer +/-10% tolerance. The remaining 461 use a project-owner-requested assumed +/-10% comparison band, visibly distinguished in red. These are not statistical confidence intervals or new measurements. All B. Braun/Baxter benchmark rows included are QF=0; nonzero HDF/HF columns were excluded at extraction. 29 other-brand rows with explicitly nonzero QF are stored but omitted from zero-UF comparison plots. Where a brochure omits QF, the UI discloses it.

Predictions use physical properties and reference closures only. Manufacturer clearances, K0A and display bands never alter prediction parameters. Chart bounds account for whiskers to avoid clipping. The Qd selector avoids mixing points at different dialysate flows on a single Qb comparison curve.

## Geometry consistency

Count=0: Nf=A/(pi*di*L). Count>0: A=pi*di*L*Nf. Positive shell internal diameter determines rd=Rshell/sqrt(Nf) and packing=(ro/rd)^2. Without measured shell diameter, entered packing determines shell diameter; adding fibre count alone cannot identify a module's inter-fibre spacing. Invalid annular geometry is rejected. Hydraulic coupling, cell exchange areas and solute balances use the effective area consistently.

## Gross filtration fraction

FF=Qgross/Qb,in; Qgross=sum(max(Jv_i*A_i,0)). The inlet denominator is total supplied blood or water, as requested, rather than plasma-water flow. Local backfiltration is separate. Net UF remains zero. At zero dialysate flow, the existing special-case branch does not solve hydraulics and FF is undefined. No numeric zero is fabricated.

## Verification

Node regression and catalog tests cover unchanged reference clearances, solute conservation, geometry closure, area/count equivalence, shell packing limits, total-flow FF definition, zero-flow handling, finite predictions for every selectable preset with water and blood, and independence from manufacturer clearances/bands. Browser verification covers preset loading, Standard blood-flow changes, Research shell geometry, both graph metrics, manufacturer Qd switching, reported/assumed error bars and PNG/SVG download rendering.


## Figure exports and attribution update

PNG and standalone SVG exports are available for both the primary prediction plot and manufacturer comparison. The primary dashed marker follows the currently selected Qd and is annotated with its value; it is no longer tied to 133.33 mL/min. Public calibration attribution identifies Hematica's in-vitro CVVHD experiments. HF1000 remains a test-module identity where relevant.

Browser QA produced and visually verified a manufacturer-comparison PNG and a primary-prediction PNG (2100x1410). Their rendering uses the same standalone SVG serialization as vector export. The preview browser did not surface an SVG file download event; the generated SVG link, filename and error-free serialization were checked, but end-to-end SVG download could not be confirmed in this preview environment.

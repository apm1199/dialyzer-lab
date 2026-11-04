# Clearance comparison audit · v0.9.2

All catalog zero-UF observations are audited using water, default physical inputs and 100 axial cells. Only eligible aqueous protocols enter the website validation selector. Ineligible observations are retained in the CSV with their status. The band is a fixed relative ±10% criterion, independent of wider manufacturer tolerances. No model coefficients or membrane assumptions are fitted to the observations.

B. Braun, Fresenius and Nipro saline medium is project-owner confirmed; the workbook supplies operating conditions but does not itself establish their clearance-test medium. Theranova A6/A7 explicitly use aqueous solution; ST uses documented saline. Other Baxter and Lepu media remain unverified. Medtronic and Nephros are removed from current selectors at the project owner’s request; this does not assert that all their devices are HDF-only. Specialty devices remain outside scope.

| Manufacturer | Models | Points | Within ±10% | Models with at least one failure | Maximum absolute error |
|---|---:|---:|---:|---:|---:|
| B. Braun | 19 | 60 | 60 | 0 | 7.41% |
| Baxter | 5 | 21 | 20 | 1 | 13.96% |
| Nipro | 57 | 225 | 170 | 33 | 79.09% |
| Fresenius | 34 | 55 | 40 | 14 | 20.46% |

## Small-area modules (area ≤0.6 m²; screening flag, not a clinical classification)

| Model | Qb | Qd | Observed K | Predicted K | Difference | Change at 400 cells |
|---|---:|---:|---:|---:|---:|---:|
| Prismaflex ST60 | 100 | 17 | 17 | 14.63 | -13.96% | -0.233% |
| Prismaflex ST60 | 100 | 42 | 40 | 38.22 | -4.45% | -0.293% |
| Prismaflex ST60 | 100 | 67 | 56 | 54.54 | -2.61% | -0.394% |
| SUREFLUX 05E | 200 | 500 | 151 | 179.12 | 18.62% | -0.342% |
| SUREFLUX 05E | 300 | 500 | 182 | 226.73 | 24.58% | -0.638% |
| SUREFLUX 05E | 400 | 500 | 193 | 255.16 | 32.20% | -0.812% |
| SUREFLUX 03L | 200 | 500 | 92 | 153.02 | 66.33% | -0.767% |
| SUREFLUX 03L | 300 | 500 | 103 | 182.09 | 76.79% | -1.069% |
| SUREFLUX 03L | 400 | 500 | 111 | 198.79 | 79.09% | -1.232% |
| SUREFLUX 05L | 200 | 500 | 141 | 178.62 | 26.68% | -0.350% |
| SUREFLUX 05L | 300 | 500 | 169 | 225.95 | 33.70% | -0.645% |
| SUREFLUX 05L | 400 | 500 | 183 | 254.25 | 38.93% | -0.818% |
| FX 40 | 200 | 500 | 170 | 176.19 | 3.64% | -0.398% |
| F3 | 200 | 500 | 125 | 146.47 | 17.18% | -0.863% |
| FX paed | 100 | 300 | 76 | 68.80 | -9.48% | -0.961% |

## Models outside ±10%

| Model | Failing / total eligible points | Error range |
|---|---:|---:|
| Baxter Prismaflex ST60 | 1/3 | -13.96 to -2.61% |
| Nipro ELISIO 11M | 1/5 | 2.39 to 12.22% |
| Nipro ELISIO 13M | 1/5 | 2.52 to 12.02% |
| Nipro ELISIO 15M | 1/5 | 1.97 to 11.87% |
| Nipro ELISIO 17M | 1/5 | 2.07 to 10.83% |
| Nipro ELISIO 19M | 1/5 | 1.93 to 10.64% |
| Nipro ELISIO 11L | 2/5 | 3.43 to 13.40% |
| Nipro ELISIO 13L | 1/5 | 3.02 to 12.86% |
| Nipro ELISIO 15L | 1/5 | 2.47 to 12.65% |
| Nipro ELISIO 17L | 1/5 | 2.58 to 11.58% |
| Nipro ELISIO 19L | 1/5 | 2.44 to 11.36% |
| Nipro ELISIO 21L | 1/5 | 1.64 to 10.11% |
| Nipro SUREFLUX 05E | 3/3 | 18.62 to 32.20% |
| Nipro SUREFLUX 07E | 3/3 | 13.14 to 27.47% |
| Nipro SUREFLUX 09E | 3/3 | 10.26 to 23.50% |
| Nipro SUREFLUX 11E | 2/3 | 5.68 to 21.90% |
| Nipro SUREFLUX 13E | 1/3 | 4.10 to 20.73% |
| Nipro SUREFLUX 15E | 1/3 | 2.79 to 18.24% |
| Nipro SUREFLUX 17E | 1/3 | 1.89 to 17.21% |
| Nipro SUREFLUX 19E | 1/3 | 0.93 to 16.56% |
| Nipro SUREFLUX 21E | 1/3 | 0.46 to 16.68% |
| Nipro SUREFLUX 03L | 3/3 | 66.33 to 79.09% |
| Nipro SUREFLUX 05L | 3/3 | 26.68 to 38.93% |
| Nipro SUREFLUX 07L | 3/3 | 18.64 to 37.47% |
| Nipro SUREFLUX 09L | 3/3 | 13.38 to 29.42% |
| Nipro SUREFLUX 11L | 2/3 | 8.54 to 25.93% |
| Nipro SUREFLUX 13L | 2/3 | 6.30 to 22.73% |
| Nipro SUREFLUX 15L | 2/3 | 4.39 to 20.15% |
| Nipro SUREFLUX 17L | 1/3 | 2.93 to 18.72% |
| Nipro SUREFLUX 19L | 1/3 | 1.96 to 18.78% |
| Nipro SUREFLUX 21L | 1/3 | 1.48 to 18.50% |
| Nipro SUREFLUX 11UX | 3/5 | 2.51 to 14.33% |
| Nipro SUREFLUX 13UX | 2/5 | 2.56 to 12.81% |
| Nipro SUREFLUX 15UX | 1/5 | 1.27 to 11.23% |
| Fresenius FX 5 | 1/2 | 6.32 to 11.90% |
| Fresenius F50S | 1/2 | 6.57 to 11.24% |
| Fresenius F60S | 1/2 | 5.47 to 10.08% |
| Fresenius F70S | 1/2 | 4.02 to 12.95% |
| Fresenius HF80S | 1/2 | 3.40 to 13.53% |
| Fresenius F7HPS | 1/2 | 4.97 to 11.56% |
| Fresenius F8HPS | 1/2 | 4.38 to 11.34% |
| Fresenius F10HPS | 1/1 | 11.01 to 11.01% |
| Fresenius F3 | 1/1 | 17.18 to 17.18% |
| Fresenius F4 | 1/1 | 13.58 to 13.58% |
| Fresenius F5 | 2/2 | 10.98 to 20.46% |
| Fresenius F6 | 1/2 | 8.04 to 19.19% |
| Fresenius F7 | 1/2 | 7.20 to 16.62% |
| Fresenius F8 | 1/2 | 6.59 to 16.79% |

Theranova workbook A7 has an inconsistent QB-code description; the catalog Qb400/500 values use the separately retained Theranova datasheet transcription, not an automatic repair of the workbook. Missing length, porosity, tortuosity, packing and other fields remain declared reference assumptions. A 100-to-400 cell comparison is a refinement check, not proof of full numerical convergence.

## Reproducing the 7,500-fibre concern

This is a new controlled comparison, not a reconstruction of an unrecorded historical browser state. At Qb=300 and Qd=500 mL/min, water, zero net UF, all Baxter reference properties with 7,500 fibres give area=1.1054 m² and K=246.93 mL/min. The actual commercial presets instead give:

| Observed model | Manufacturer K | Full Baxter reference K | Full Baxter error | Commercial preset K | Commercial preset error |
|---|---:|---:|---:|---:|---:|
| Fresenius FX5 | 228 | 246.93 | +8.30% | 255.13 | +11.90% |
| Nipro SUREFLUX 15E | 265 | 246.93 | −6.82% | 288.14 | +8.73% |
| Nipro ELISIO 15H | 270 | 246.93 | −8.54% | 275.56 | +2.06% |

For example, SUREFLUX15E uses nominal area1.5m², length227mm, inner diameter200µm, wall15µm and Lp12. With area as input the equivalent count is10,517. Forcing7,500 at that same length and diameter changes area to1.0697m²; it does not preserve the nominal1.5m². Conversely,7,500 fibres can preserve1.5m² only by changing active length to318.31mm. Number, area, length and diameter cannot all be independent: A=Nf*pi*di*L.

The geometry function uses this relation explicitly, and the UI disables direct area input when the count is specified. Membrane porosity, tortuosity, pore diffusivity, hindrance and packing are still common reference assumptions where commercial data are missing. These tests neither establish universal transfer nor demonstrate an error in the solver. The numerical solver in docs/design.js is text-identical to the current production version before this update.

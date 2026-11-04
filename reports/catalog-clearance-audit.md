# Clearance comparison audit · v0.9.3

Design calculations use a fixed40 mm internal module diameter as an assumption unless documented otherwise. Packing and equivalent dialysate radius follow fibre count. The original reference-normalisation geometry remains unchanged (packing0.5; equivalent internal module diameter38.6162mm for the HF1000 geometry). No empirical coefficients or manufacturer clearance targets are fitted. Enter0 for module diameter in Research mode to prescribe packing instead.

| Manufacturer | Models | Eligible points | Calculated | Within ±10% | Not calculable | Maximum absolute error |
|---|---:|---:|---:|---:|---:|---:|
| B. Braun | 19 | 60 | 59 | 53 | 1 | 13.88% |
| Baxter | 5 | 21 | 21 | 20 | 0 | 14.79% |
| Nipro | 57 | 225 | 225 | 189 | 0 | 21.02% |
| Fresenius | 34 | 55 | 53 | 42 | 2 | 38.53% |

Eligibility uses the aqueous zero-UF protocol, independently of numerical success or accuracy. B.Braun/Fresenius/Nipro saline medium is project-owner confirmed. Theranova A6/A7 is documented aqueous and ST documented saline. Unknown media/nonzero UF are not admitted; Medtronic/Nephros remain outside current selection.

## Noncalculable eligible observations

- B. Braun xevonta Hi 23: Qb=200, Qd=500. This design exhausts the blood-water carrier inside the filter. Reduce hydraulic permeability or change the operating conditions.
- Fresenius FX classix 100: Qb=300, Qd=500. This design exhausts the blood-water carrier inside the filter. Reduce hydraulic permeability or change the operating conditions.
- Fresenius FX classix 100: Qb=400, Qd=500. This design exhausts the blood-water carrier inside the filter. Reduce hydraulic permeability or change the operating conditions.

These points remain visible and are not assigned zero clearance or treated as clinical incompatibility. The reference length or assumed40mm internal diameter may require correction from physical measurements. No automatic enlargement or packing fallback is applied.

## Small-area modules (area ≤0.6m²; not a clinical classification)

| Model | Qb | Qd | Observed | Predicted | Difference |
|---|---:|---:|---:|---:|---:|
| Prismaflex ST60 | 100 | 17 | 17 | 14.49 | -14.79% |
| Prismaflex ST60 | 100 | 42 | 40 | 37.42 | -6.45% |
| Prismaflex ST60 | 100 | 67 | 56 | 52.56 | -6.13% |
| SUREFLUX 05E | 200 | 500 | 151 | 156.44 | 3.60% |
| SUREFLUX 05E | 300 | 500 | 182 | 187.70 | 3.13% |
| SUREFLUX 05E | 400 | 500 | 193 | 205.83 | 6.65% |
| SUREFLUX 03L | 200 | 500 | 92 | 111.09 | 20.75% |
| SUREFLUX 03L | 300 | 500 | 103 | 124.23 | 20.61% |
| SUREFLUX 03L | 400 | 500 | 111 | 131.49 | 18.46% |
| SUREFLUX 05L | 200 | 500 | 141 | 156.38 | 10.91% |
| SUREFLUX 05L | 300 | 500 | 169 | 187.60 | 11.01% |
| SUREFLUX 05L | 400 | 500 | 183 | 205.69 | 12.40% |
| FX 40 | 200 | 500 | 170 | 158.07 | -7.02% |
| F3 | 200 | 500 | 125 | 119.91 | -4.08% |
| FX paed | 100 | 300 | 76 | 46.72 | -38.53% |

## Models with points outside ±10%

| Model | Outside / calculated | Error range |
|---|---:|---:|
| B. Braun xevonta Hi 18 | 1/4 | 0.86 to 10.29% |
| B. Braun xevonta Hi 20 | 1/4 | 0.50 to 12.05% |
| B. Braun xevonta Hi 23 | 2/3 | 3.45 to 13.88% |
| B. Braun xevonta Lo 23 | 1/3 | 0.48 to 11.28% |
| B. Braun Diacap Pro 19L | 1/3 | 1.95 to 10.55% |
| Baxter Prismaflex ST60 | 1/3 | -14.79 to -6.13% |
| Nipro ELISIO 15M | 1/5 | 1.72 to 10.62% |
| Nipro ELISIO 17M | 1/5 | 2.03 to 10.58% |
| Nipro ELISIO 19M | 1/5 | 2.00 to 11.22% |
| Nipro ELISIO 21M | 1/5 | 1.24 to 10.95% |
| Nipro ELISIO 13L | 1/5 | 2.39 to 10.38% |
| Nipro ELISIO 15L | 1/5 | 2.22 to 11.44% |
| Nipro ELISIO 17L | 1/5 | 2.54 to 11.34% |
| Nipro ELISIO 19L | 1/5 | 2.50 to 11.91% |
| Nipro ELISIO 21L | 1/5 | 1.74 to 11.31% |
| Nipro SUREFLUX 07E | 1/3 | 6.20 to 12.01% |
| Nipro SUREFLUX 09E | 1/3 | 6.87 to 13.36% |
| Nipro SUREFLUX 11E | 1/3 | 4.07 to 14.89% |
| Nipro SUREFLUX 13E | 1/3 | 3.34 to 15.86% |
| Nipro SUREFLUX 15E | 1/3 | 2.45 to 14.89% |
| Nipro SUREFLUX 17E | 1/3 | 1.74 to 14.95% |
| Nipro SUREFLUX 19E | 1/3 | 0.87 to 15.05% |
| Nipro SUREFLUX 21E | 1/3 | 0.44 to 15.72% |
| Nipro SUREFLUX 03L | 3/3 | 18.46 to 20.75% |
| Nipro SUREFLUX 05L | 3/3 | 10.91 to 12.40% |
| Nipro SUREFLUX 07L | 3/3 | 11.48 to 21.02% |
| Nipro SUREFLUX 09L | 2/3 | 9.96 to 18.95% |
| Nipro SUREFLUX 11L | 2/3 | 6.92 to 18.81% |
| Nipro SUREFLUX 13L | 2/3 | 5.54 to 17.89% |
| Nipro SUREFLUX 15L | 1/3 | 4.05 to 16.82% |
| Nipro SUREFLUX 17L | 1/3 | 2.79 to 16.45% |
| Nipro SUREFLUX 19L | 1/3 | 1.90 to 17.27% |
| Nipro SUREFLUX 21L | 1/3 | 1.46 to 17.54% |
| Fresenius F70S | 1/2 | 4.39 to 14.26% |
| Fresenius HF80S | 1/2 | 3.92 to 16.16% |
| Fresenius HdF100S | 1/1 | 10.68 to 10.68% |
| Fresenius F7HPS | 1/2 | 5.24 to 12.48% |
| Fresenius F8HPS | 1/2 | 4.76 to 12.98% |
| Fresenius F10HPS | 1/1 | 14.65 to 14.65% |
| Fresenius F5 | 1/2 | 9.12 to 16.84% |
| Fresenius F6 | 1/2 | 7.82 to 18.61% |
| Fresenius F7 | 1/2 | 7.44 to 17.46% |
| Fresenius F8 | 1/2 | 6.91 to 18.19% |
| Fresenius FX paed | 1/1 | -38.53 to -38.53% |

Maximum absolute100-to-400 cell refinement change: 1.725%. This is a refinement check, not a full convergence proof. Theranova workbookA7 QB-code inconsistency is resolved against the retained manufacturer datasheet, whose aqueous table explicitly gives400/800 and500/800.

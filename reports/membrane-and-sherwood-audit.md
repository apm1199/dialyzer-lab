# Membrane and fluid-side transfer inputs — 0.7.1

Standard mode exposes water/blood selection, total inlet Qb, dialysate Qd, area, fibre length, lumen diameter, membrane thickness and Lp. All remaining solver inputs are editable in Research mode. Switching modes preserves entered values.

Membrane properties include porosity, tortuosity, effective-medium pore-fluid diffusivity, hindrance/partition factor and intrinsic Darcy permeability as an alternative to Lp. Module packing is independently editable. Pore size is not separately parameterised: no pore-size-to-permeability or pore-size-to-hindrance relation is assumed. With fixed Lp, pore viscosity cancels from hydraulic conductance and changes derived Darcy permeability only.

Feed Sherwood is 4.36, the developed-flow reference discussed in thesis §5.2. Dialysate Sherwood is a separate constant, 3.66; no cylindrical-lumen reference is automatically transferred to the annulus. Both can be changed in Research. The existing HF1000 calibration data and continuation are retained; the 1D reference denominator uses the same updated default closure as the default design. Calibration reconstruction therefore remains exact.

The calculator is a reduced effective-medium model. New membrane geometry, material inputs and operating conditions generate predictions; the manufacturer clearance remains an external comparison only. Unknown material properties are assumptions. Agreement within one filter family does not establish universal validity.

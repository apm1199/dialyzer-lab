/* Use product-specific permeance where selected; otherwise assume a module conductance. */
(function(root){'use strict';
const C=typeof module!=='undefined'&&module.exports?require('./catalog-geometry.js'):root.DialyzerCatalog;
const moduleConductance=35;
const SI=1e-6/3600/133.322387415;
const phyltherPermeance={
 id:'phylther-hf-15sd-17sd-cancilla',preset:true,label:'Phylther HF 15 SD / 17 SD · published model input',
 filterIds:['bellco-phylther-hf-15-sd','bellco-phylther-hf-17-sd'],automatic:true,
 lp:6.6e-11/SI,absoluteUncertainty:0.4e-11/SI,temperature_C:null,basis:'inner-area',
 url:'https://iris.unipa.it/retrieve/e3ad8928-e9b6-da0e-e053-3705fe0a2b96/PhD_Thesis_Cancilla_Nunzio.pdf',
 location:'Cancilla thesis, Table 5.3',
 scope:'Medtronic-supplied membrane permeance used in the published 15 SD and 17 SD simulations: (6.6 ± 0.4) × 10⁻¹¹ m/(Pa·s). Dialyzer Lab uses the inner-area convention. The source does not specify the permeance measurement conditions.'
};
const profiles=[phyltherPermeance,
 {id:'polyflux210h-water',preset:true,label:'Polyflux 210H · measured purified water',filterIds:['baxter-polyflux-210-h'],automatic:true,lp:312,temperature_C:37,temperatureTolerance_C:1,mu_Pas:0.0006913,diameter_um:215,thickness_um:50,basis:'inner-area',relativeUncertaintyPct:5,url:'https://doi.org/10.1038/s41598-019-42783-w',location:'Voigt et al. 2019, Table 1; six filters',scope:'Exact model, stated geometry and purified-water measurement. Water viscosity at 37°C is an explicit conversion assumption.'},
 {id:'theranova500-water',preset:true,label:'Theranova 500 · measured purified water',filterIds:['baxter-theranova-500'],automatic:true,lp:636,temperature_C:37,temperatureTolerance_C:1,mu_Pas:0.0006913,diameter_um:180,thickness_um:35,basis:'inner-area',relativeUncertaintyPct:5,url:'https://doi.org/10.1038/s41598-019-42783-w',location:'Voigt et al. 2019, Table 1; six filters',scope:'Exact model, stated geometry and purified-water measurement. Water viscosity at 37°C is an explicit conversion assumption.'},
 {id:'elisio19h-water',label:'ELISIO 19H · water measurement; temperature unresolved',filterIds:['nipro-elisio-19h'],automatic:true,lp:2.60e-10/SI,temperature_C:null,basis:'inner-area',relativeUncertaintyPct:3,url:'https://doi.org/10.3390/membranes14090200',location:'Karabelas et al. 2024, section 4.3.2',scope:'New ELISIO19H modules, clean water, Kp=2.60e-10 m/(Pa s). Measurement temperature unresolved; using the entered pore viscosity is a scenario assumption.'},
 {id:'xevonta-hi-water-family',label:'xevonta Hi · family water measurement; product and area basis unresolved',filterIds:[],automatic:false,lp:163*1.33322387415,temperature_C:20,mu_Pas:0.001002,basis:null,url:'https://patents.google.com/patent/US10500549B2/en',location:'B. Braun patent; commercial xevonta Hi comparator; methods and comparative results',scope:'163±4 L/(m² h bar), water normalised to20°C. Exact SKU and inner/outer area basis unspecified. The Research profile requires an explicit area basis. Hi presets use a rounded value of 217 on an assumed inner-area basis.'},
 {id:'polyflux2h-water-fibres',label:'Polyflux 2H fibres · repotted module; temperature unresolved',filterIds:['baxter-polyflux-2h'],automatic:true,lp:144,absoluteUncertainty:25,temperature_C:null,basis:'inner-area',url:'https://ris.utwente.nl/ws/portalfiles/portal/250558789/Ter_beek_2021_In_vitro_study_of_dual_layer_mixed_.pdf',location:'ter Beek et al. 2021, methods 2.3.2 and Fig.4/Table3',scope:'Ultrapure-water measurement on repotted fibres; temperature unresolved. Measured fibre dimensions differ from nominal. Mini-module length is not commercial filter active length.'},
 {id:'fx1000-water-fibres',label:'FX1000 fibres · water; geometry/version and temperature unresolved',filterIds:[],automatic:false,lp:60,temperature_C:null,basis:'inner-area',url:'https://doi.org/10.1111/aor.70139',location:'Torrents-Yeste et al. 2026, methods 2.2.2 and results 3.1',scope:'Ultrapure water in repotted mini-modules; temperature unresolved. SEM bore~190µm differs from catalog210µm. Not automatically mapped to FX1000/FXCorDiax variants.'},
 {id:'fxcordiax800-water-version',label:'FX CorDiax800 · measured water; different product geometry',filterIds:[],automatic:false,lp:276,temperature_C:37,mu_Pas:0.0006913,diameter_um:200,thickness_um:45,basis:'inner-area',relativeUncertaintyPct:5,url:'https://doi.org/10.1038/s41598-019-42783-w',location:'Voigt et al. 2019, Table 1',scope:'Measured version: area2.0m², bore200µm, wall45µm. Current FX800 catalog:1.8m²,210µm,35µm. Version mapping unresolved; manual Research scenario only.'}
];
for(const f of C.filters){if(f.id==='reference')continue;delete f.properties.Lp;delete f.properties.darcy_m2;f.notes=f.notes.filter(n=>!/^Lp is total KUF/.test(n));f.hydraulicEvidence=profiles.find(s=>s.automatic&&s.filterIds.includes(f.id))||null;}
function sourceFor(id){return profiles.find(s=>s.automatic&&s.filterIds.includes(id))||null;}
function darcyFromSource(s){if(!Number.isFinite(s.mu_Pas)||!Number.isFinite(s.diameter_um)||!Number.isFinite(s.thickness_um)||s.basis!=='inner-area')return null;const ri=s.diameter_um*1e-6/2,lc=ri*Math.log1p(s.thickness_um*1e-6/ri);return s.lp*SI*s.mu_Pas*lc;}
const xevontaHiDefault={
 ...profiles.find(profile=>profile.id==='xevonta-hi-water-family'),
 lp:217,basis:'inner-area',absoluteUncertainty:4*1.33322387415,
 scope:'Family-level water measurement at 20°C: 217.32 ± 5.33 mL/(h·mmHg·m²). The Hi preset uses 217 and assumes an inner-area basis. The exact tested size and source area basis are unspecified.'
};
const multiflowDefault={
 id:'multiflow-project-lp',label:'Multiflow 60 / 100 · project-supplied permeance',
 lp:21.33,basis:'inner-area',temperature_C:null,evidenceKind:'project-input',
 location:'Project owner input',
 scope:'Project-supplied Lp = 21.33 mL/(h·mmHg·m²) for Multiflow 60 and 100. The model uses the inner-area convention. Measurement conditions and primary source remain to be documented.'
};
function defaultHydraulicSource(id){
 if(['hospal-multiflow-60','hospal-multiflow-100'].includes(id))return multiflowDefault;
 if(/^b-braun-xevonta-hi-\d+$/.test(id)&&/\bamembris\b/i.test(C.find(id)?.material??''))return xevontaHiDefault;
 return profiles.find(profile=>profile.preset&&profile.filterIds.includes(id))||null;
}
function properties(D,id,qb){
 const p=C.properties(D,id,qb);
 if(id==='reference')return p;
 const source=defaultHydraulicSource(id);
 if(source)return {...p,Lp:source.lp,darcy_m2:0,hydraulicMode:'Lp',hydraulicBasis:source.basis};
 const area=p.fiberCount>0?D.geometry(p).area:p.area_m2;
 return {...p,Lp:moduleConductance/area,darcy_m2:0,hydraulicMode:'Lp',hydraulicBasis:'inner-area'};
}
function applyWaterProfile(D,p,profileId,basis){const s=profiles.find(s=>s.id===profileId);if(!s)throw Error('Select a water-measurement profile.');if(s.basis===null&&!['inner-area','planar'].includes(basis))throw Error('The source does not state the area basis. Select an explicit Research interpretation.');const out={...p,Lp:s.lp,hydraulicBasis:s.basis||basis},k=darcyFromSource(s);if(k!==null){out.hydraulicMode='darcy';out.darcy_m2=k;}else{out.hydraulicMode='Lp';out.darcy_m2=0;}return out;}
function hydraulicProfile(D,id,p,profileId){const s=profiles.find(s=>s.id===profileId)||defaultHydraulicSource(id),legacy=id==='reference',active=p.hydraulicMode==='darcy'?p.darcy_m2:p.Lp,available=Number.isFinite(active)&&active>=0;const enteredModuleConductance=p.hydraulicMode==='Lp'&&p.hydraulicBasis==='inner-area'?p.Lp*(p.fiberCount>0?D.geometry(p).area:p.area_m2):null;const shared=!legacy&&!s&&Number.isFinite(enteredModuleConductance)&&Math.abs(enteredModuleConductance-moduleConductance)<1e-8;let state=legacy?'historical-reference':s?(s.evidenceKind||'water-literature'):shared?'shared-module-assumption':'user-input';if(!available)state='missing-water-input';return {filterId:id,state,available,enteredModuleConductance,inputMode:p.hydraulicMode,hydraulicBasis:p.hydraulicBasis,enteredLp:p.Lp,enteredDarcy:p.darcy_m2,source:s||null,sourceValueMatches:s?(p.hydraulicMode==='Lp'?(s.basis===null||p.hydraulicBasis===s.basis)&&Math.abs(p.Lp/s.lp-1)<1e-10:darcyFromSource(s)!==null&&Math.abs(p.darcy_m2/darcyFromSource(s)-1)<1e-10):false,bloodKufUsed:legacy?'historical-reference-only':false,referenceNote:legacy?'The historical normalisation retains Lp32 as an implemented calibration assumption. It is not an independently verified pristine-water measurement and is not copied into commercial presets.':null,scope:s?s.scope:shared?'Shared assumed module conductance: 35 mL/(h·mmHg), divided by model inner area. This is a scenario input, not a measured value for this filter.':available?'User-specified hydraulic input; verify its measurement conditions.':'No verified automatic water-hydraulic input. Enter a measured water permeance or equivalent Darcy permeability; blood KUF/A is not used.'};}
function assumptions(f){return [...new Set([...C.assumptions(f).filter(k=>k!=='Lp'&&k!=='darcy_m2'),...(f.id!=='reference'&&!defaultHydraulicSource(f.id)?['sharedModuleConductance']:[])])];}
const api={...C,properties,assumptions,hydraulicProfile,waterProfiles:profiles,sourceFor,darcyFromSource,applyWaterProfile};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DialyzerCatalog=api;
})(typeof window!=='undefined'?window:globalThis);

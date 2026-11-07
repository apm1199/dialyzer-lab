/* Public, model-specific geometry evidence. No clearance targets or fitted coefficients. */
(function(root){'use strict';
const C=typeof module!=='undefined'&&module.exports?require('./catalog-design.js'):root.DialyzerCatalog;
const clearum={label:'Manufacturer submission FDA K193542',url:'https://www.accessdata.fda.gov/cdrh_docs/pdf19/K193542.pdf',location:'summary pp.4–5, Table 5-1'},diacap={label:'B. Braun submission FDA K170574',url:'https://www.accessdata.fda.gov/cdrh_docs/pdf17/K170574.pdf',location:'summary p.2, technical comparison'},theranova={label:'Lorenzin et al., 2018, doi:10.1159/000489993',url:'https://doi.org/10.1159/000489993',location:'Table 1; active length excludes potting'};
const corrections=[];
function record(id,values,source,note){const f=C.find(id);if(!f)throw Error('Unknown geometry evidence target: '+id);f.properties={...f.properties,...values};f.geometryFieldSources={...f.geometryFieldSources,...Object.fromEntries(Object.keys(values).map(k=>[k,source]))};if(values.fiberCount)f.fiberCountProvenance={kind:'reported-source',source:source.url,label:source.label,location:source.location,count:values.fiberCount};if(!f.notes.includes(note))f.notes.push(note);corrections.push({id,values,source,note});}
for(const [size,L,N,bore,total]of [[13,246,8600,36.75,306],[15,246,9900,36.75,306],[17,246,11150,39.4,306],[20,308,10400,39.4,366],[22,308,11200,39.4,366]])record('medtronic-clearum-hs-'+size,{length_mm:L,fiberCount:N,shellDiameter_mm:bore,totalLength_mm:total},clearum,'Active length, fibre count and minimum inside housing diameter are reported in FDA K193542. A constant equivalent bore uses that minimum diameter; the real casing need not be uniform. Nominal area and area calculated from rounded dimensions remain distinct.');
for(const [size,N]of [[140,7500],[170,9300],[210,12000]])record('baxter-polyflux-'+size+'-h',{length_mm:270,fiberCount:N},clearum,'Polyflux H active length and counts are reported for the predicate in FDA K193542, with 215 µm bore. The older K030592 submission states approximately 200 µm: do not silently combine editions. Current catalog bore is retained.');
for(const [size,N]of [[13,8800],[16,10840],[19,12870]])record('b-braun-diacap-pro-'+size+'h',{length_mm:235,fiberCount:N},diacap,'Mean free fibre length and mean fibre count are reported specifically for Diacap Pro 13H/16H/19H in FDA K170574. No length is transferred to Pro 08H, Pro L, acute or other families.');
for(const [size,N]of [[400,12960],[500,15120]])record('baxter-theranova-'+size,{length_mm:236,fiberCount:N,totalLength_mm:260},theranova,'Effective length and count are reported in the original Theranova 400/500 study, Table 1. Effective length excludes potting. This geometry evidence is separate from manufacturer clearance comparison data.');
for(const size of [10,12]){
 const filter=C.find('b-braun-xevonta-hi-'+size);
 filter.material='amembris polysulfone';
 filter.notes.push('B. Braun Dialog iQ technical catalogue identifies the Hi 10 and Hi 12 membranes as amembris.');
}
const xevontaHi={label:'B. Braun xevonta Hi dimensional specification',location:'§5.4'};
for(const [size,length_mm,fiberCount,totalLength_mm] of [[15,237,10750,300],[18,277,10750,340],[20,277,12250,340],[23,277,13820,340]]){
 record('b-braun-xevonta-hi-'+size,{length_mm,fiberCount,totalLength_mm},xevontaHi,'Effective fibre length ±5 mm, fibre count ±1.5%, and module length without protective caps ±2 mm. The nominal area is separate from the model area calculated from fibre geometry.');
}
record('fresenius-fx-60',{length_mm:228,fiberCount:10752,diameter_um:184,thickness_um:37,shellDiameter_mm:34},{label:'Fresenius manufacturer patent US20240286082A1',url:'https://patents.google.com/patent/US20240286082A1/en',location:'Table1, commercial FX60 comparative specimen'},'Geometry follows the coherent FX60 comparative specimen reported by the manufacturer: free effective length228mm,10752fibres,184µm bore,37µm wall and34mm internal housing. This is specimen-specific; check commercial edition compatibility against nominal datasheet dimensions. No clearance value from the patent is used.');
const phylther={label:'Bellco PHYLTHER HF technical data sheet, Rev. 04 (12/2013)',url:'https://id.scribd.com/document/410808412/Tech-Sheet-Phylther-Hf-Rev-04-gb',location:'p. 4, technical characteristics'};
for(const [size,area_m2,length_mm,fiberCount,shellDiameter_mm,totalLength_mm,urea] of [
 [11,1.1,241,7200,31.5,305,[193,262,304]],
 [13,1.3,241,8600,34.5,305,[195,267,313]],
 [15,1.5,241,9600,36.5,305,[196,273,322]],
 [17,1.7,241,11200,39.5,305,[197,277,329]],
 [20,2.0,301,10400,39.5,365,[198,278,331]],
 [22,2.2,301,11400,39.5,365,[198,279,333]]
]){
 for(const variant of ['G','SD']){
  const id='bellco-phylther-hf-'+size+'-'+variant.toLowerCase();
  C.filters.push({
   id,name:'Phylther HF '+size+' '+variant,manufacturer:'Bellco',category:'chronic-hd',
   material:'Polyphenylene H · '+(variant==='G'?'gamma sterilised':'moist-heat sterilised'),
   properties:{},source:{file:phylther.label,page:4,url:phylther.url},
   notes:['The technical sheet lists HD, HF and HDF. The preset is available for numerical exploration. The zero-UF urea table follows EN 1283 and reports common values for G and SD. The test is classified as aqueous from the cited method; exact solution composition is unspecified.'],
   benchmarks:urea.map((k,i)=>({qb:200+100*i,qd:500,qf:0,k,lower:k*.9,upper:k*1.1,uncertaintyKind:'assumed-comparison-band'})),
   protocol:{clearanceTestFluid:'water',verifiedClearanceSource:{medium:'aqueous by EN 1283 (exact composition unspecified)',label:phylther.label,page:5,url:phylther.url}}
  });
  record(id,{area_m2,length_mm,fiberCount,shellDiameter_mm,totalLength_mm,diameter_um:200,thickness_um:30},phylther,'Uses effective fibre length and the minimum reported internal housing diameter as the equivalent bore. The nominal area is separate from the area calculated from fibre geometry.');
 }
}
// Exploratory Multiflow scenarios combine nominal AN69 M-set performance with historical geometry.
const multiflowClearance={
 label:'Baxter AN69 M60/M100/M150 and ST sets specification, July 2020',
 url:'https://usrenalacute.baxter.com/sites/g/files/ebysai3231/files/2020-09/AN69ST_Sets_Spec_Sheet.pdf',
 page:2
};
const multiflow60Geometry={
 label:'Rambod et al. 2010, historical Multiflow M60 geometry; version match unresolved',
 url:'https://doi.org/10.1186/1475-925X-9-21',location:'Numerical Model'
};
const multiflow100Geometry={
 label:'FDA K980386, historical Multiflow 100 geometry; version match unresolved',
 url:'https://www.accessdata.fda.gov/cdrh_docs/pdf/k980386.pdf',location:'Device Description'
};
for(const spec of [
 {size:60,area:0.6,length:150,shell:33,qb:100,qd:[17,42,67],clearance:[17,39,54],geometry:multiflow60Geometry,count:4400},
 {size:100,area:0.9,length:270,qb:150,qd:[17,42,67,133],clearance:[17,41,63,95],geometry:multiflow100Geometry,count:6000}
]){
 const properties={area_m2:spec.area,length_mm:spec.length,diameter_um:240,thickness_um:50};
 if(spec.shell)properties.shellDiameter_mm=spec.shell;
 C.filters.push({
  id:'hospal-multiflow-'+spec.size,
  name:'Multiflow '+spec.size+' (M'+spec.size+' AN69 scenario)',
  manufacturer:'Hospal / Gambro',category:'acute-crrt',material:'AN69 acrylonitrile / sodium methallyl sulfonate copolymer',
  properties,
  source:{file:multiflowClearance.label,page:multiflowClearance.page,url:multiflowClearance.url},
  geometryFieldSources:{
   area_m2:{label:multiflowClearance.label,url:multiflowClearance.url,location:'Physical characteristics, p. 1'},
   diameter_um:{label:multiflowClearance.label,url:multiflowClearance.url,location:'Physical characteristics, p. 1'},
   thickness_um:{label:multiflowClearance.label,url:multiflowClearance.url,location:'Physical characteristics, p. 1'},
   length_mm:spec.geometry,
   ...(spec.shell?{shellDiameter_mm:spec.geometry}:{})
  },
  notes:[
   'Exploratory scenario: zero-UF urea benchmarks are from the 2020 AN69 M'+spec.size+' set. Historical Hospal Multiflow geometry is used; matching product editions remains unresolved.',
   'Nominal membrane area is authoritative. Fibre count is calculated from area, bore and active length. The historical reported count ('+spec.count+') is not imposed because it is inconsistent with that area and the listed dimensions.',
   'Active fibre length '+spec.length+' mm is taken from '+spec.geometry.label+'.',
   spec.shell?'The 33 mm internal housing diameter is reported for the historical M60 specimen.':'The internal housing diameter is assumed to be 40 mm; verify the actual module.',
   'Clearance was measured in saline solution at 37°C and zero net UF, with a manufacturer ±10% urea tolerance. Dialysate flow values follow the rounded mL/min entries in the performance table.',
   'Hydraulic input uses project-supplied Lp = 21.33 mL/(h·mmHg·m²) on the model inner-area basis. The primary measurement source and conditions remain to be documented.'
  ],
  benchmarks:spec.clearance.map((k,i)=>({qb:spec.qb,qd:spec.qd[i],qf:0,k,lower:k*0.9,upper:k*1.1,
   uncertaintyKind:'manufacturer-tolerance',uncertaintyNote:'Manufacturer ±10% in-vitro urea clearance tolerance; not a statistical confidence interval.'})),
  protocol:{clearanceTestFluid:'water',cvvhdIndicated:true,validationEligible:true,
   evidence:[{file:multiflowClearance.label,page:2}],
   verifiedClearanceSource:{medium:'saline solution, 37°C',label:multiflowClearance.label,url:multiflowClearance.url,page:2,qf:0},
   geometryVersionMatch:'unresolved'}
 });
}
for(const r of corrections)if(r.values.fiberCount&&!C.reportedCounts.some(x=>x.name===C.find(r.id).name))C.reportedCounts.push({name:C.find(r.id).name,count:r.values.fiberCount,source:r.source.label+' · '+r.source.location,scope:'Model-specific reported count; area calculated from count and dimensions may differ from nominal area.'});
const api={...C,geometryCorrections:corrections};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DialyzerCatalog=api;
})(typeof window!=='undefined'?window:globalThis);

const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../docs/catalog-geometry.js'),D=require('../docs/design.js');
test('catalog preserves provenance, assumptions and independently classified comparison bands',()=>{
 assert.equal(new Set(C.filters.map(f=>f.id)).size,C.filters.length);assert.ok(C.filters.length>=200);let assumed=0,reported=0;
 for(const f of C.filters){assert.ok(f.source.file,f.id);assert.ok(['acute-crrt','chronic-hd','special'].includes(f.category));if(!C.applicable(f)){assert.throws(()=>C.properties(D,f.id));assert.equal(C.comparable(f).length,0);continue;}assert.equal(C.properties(D,f.id,300).feedFlow_mLmin,300);
 for(const b of f.benchmarks){assert.ok(b.lower<=b.k&&b.k<=b.upper);if(b.uncertaintyKind==='assumed-comparison-band'){assumed++;assert.ok(Math.abs(b.lower-.9*b.k)<1e-5);assert.ok(Math.abs(b.upper-1.1*b.k)<1e-5);}else{reported++;assert.match(b.uncertaintyNote,/Manufacturer/);}}assert.ok(C.comparable(f).every(b=>b.qf===0));}assert.ok(assumed>0&&reported>0);
});
test('fixed-module presets calculate or explicitly reject physically invalid conditions without fallback',()=>{
 const expected=new Set(['baxter-evodial-2-2','baxter-nephral-st-500','baxter-theralite','fresenius-fx-classix-100','lepu-oci-hd200','lepu-oci-hf200','lepu-oci-hd20m','lepu-oci-hd21m','lepu-oci-hd23m','lepu-oci-hd25m','lepu-oci-hd210l','lepu-oci-hd230l']);const rejected=new Set();
 for(const f of C.filters.filter(C.applicable))for(const fluid of ['water','blood']){const p=C.properties(D,f.id,300);assert.equal(p.shellDiameter_mm,f.properties.shellDiameter_mm||40);if(C.geometryProfile(D,f.id,p).missingActive){assert.throws(()=>D.predict(p,fluid,500),/length_mm/);continue;}try{const r=D.predict(p,fluid,500);assert.ok(Number.isFinite(r.kWater)&&r.kWater>0,f.id);assert.ok(Number.isFinite(r.filtrationFractionPct));assert.ok(Math.abs(r.hydraulics.net_mLmin)<1e-8);}catch(e){assert.ok(expected.has(f.id),f.id+': '+e.message);assert.match(e.message,/too small|exhausts the blood-water/);assert.equal(p.shellDiameter_mm,f.properties.shellDiameter_mm||40);rejected.add(f.id);const alternate=D.predict({...p,shellDiameter_mm:0},fluid,500);assert.ok(Number.isFinite(alternate.kWater));}}
 assert.deepEqual(rejected,expected);
});
test('fibre count determines exchange area; module diameter determines equivalent annulus',()=>{const p=D.validate({fiberCount:10000,diameter_um:200,length_mm:250,thickness_um:40,shellDiameter_mm:40}),g=D.geometry(p);assert.ok(Math.abs(g.area-Math.PI*2e-4*.25*10000)<1e-12);assert.ok(Math.abs(g.rd-2e-4)<1e-14);assert.ok(Math.abs(g.packing-.49)<1e-12);const a=D.predict({...p,fiberCount:0,area_m2:g.area},'water',500),b=D.predict(p,'water',500);assert.ok(Math.abs(a.kWater-b.kWater)<1e-8);assert.ok(Math.abs(a.filtrationFraction-b.filtrationFraction)<1e-10);assert.throws(()=>D.validate({...p,shellDiameter_mm:20}),/too small/);});
test('gross fraction uses total inlet flow, independent of concentration; zero-flow is undefined',()=>{for(const fluid of ['water','blood']){const r=D.predict({feedFlow_mLmin:300},fluid,500),r2=D.predict({feedFlow_mLmin:300},fluid,500,2);assert.ok(Math.abs(r.filtrationFraction-r.hydraulics.forward_mLmin/300)<1e-14);assert.ok(Math.abs(r.filtrationFractionPct-100*r.filtrationFraction)<1e-12);assert.equal(r.filtrationFraction,r2.filtrationFraction);assert.ok(r.filtrationFraction>0);assert.equal(D.predict({},fluid,0).filtrationFraction,null);}});
test('manufacturer clearance and error bands cannot change inputs or prediction',()=>{const f=C.find('baxter-evodial-1-0'),before=C.properties(D,f.id,300),k=D.predict(before,'water',500).kWater,old=f.benchmarks;try{f.benchmarks=old.map(b=>({...b,k:1,lower:0,upper:100000}));assert.deepEqual(C.properties(D,f.id,300),before);assert.equal(D.predict(C.properties(D,f.id,300),'water',500).kWater,k);}finally{f.benchmarks=old;}});


test('zero-UF comparison eligibility applies per observation under the project water convention',()=>{
 const eligible=C.filters.filter(f=>C.comparable(f).length);assert.equal(eligible.length,139);assert.equal(eligible.flatMap(C.comparable).length,460);
 for(const f of eligible)assert.ok(C.comparable(f).every(b=>b.qf===0));
 const base=C.find('baxter-prismaflex-st100');for(const medium of ['blood','unknown'])assert.equal(C.comparable({...base,protocol:{...base.protocol,clearanceTestFluid:medium}}).length,C.comparable(base).length);
 for(const qf of [undefined,null,1,-1])assert.equal(C.comparable({...base,benchmarks:base.benchmarks.map(b=>({...b,qf}))}).length,0);
 assert.ok(C.comparable(C.find('baxter-evodial-1-0')).length);
});
test('prediction error does not determine manufacturer dataset eligibility',()=>{const f=C.find('baxter-prismaflex-st100');assert.equal(C.comparable({...f,benchmarks:f.benchmarks.map(b=>({...b,k:1e6}))}).length,C.comparable(f).length);});
test('eligible observations remain visible even when geometry or hydraulic feasibility prevents prediction',()=>{
 const invalid=[];for(const f of C.filters)for(const b of C.comparable(f)){try{const r=D.predict(C.properties(D,f.id,b.qb),'water',b.qd);assert.ok(Number.isFinite(r.kWater));assert.ok(Math.abs(r.hydraulics.net_mLmin)<1e-8);}catch(e){assert.match(e.message,/exhausts the blood-water|length_mm/);invalid.push([f.id,b.qb,b.qd]);}}
 assert.equal(invalid.length,18);assert.equal(invalid.filter(x=>x[0].startsWith('medtronic-hcd')).length,8);
 const csv=require('node:fs').readFileSync(require('node:path').join(__dirname,'../docs/catalog-clearance-audit.csv'),'utf8');assert.equal(csv.split('"not-calculable"').length-1,10);assert.ok(csv.includes('"moduleDiameter_mm"'));
});
test('all supported blood/dialysate filters remain selectable independently of brand',()=>{
 assert.equal(C.filters.filter(C.applicable).length,192);
 for(const f of C.filters)assert.equal(C.applicable(f),f.category!=='special'||f.modelRole==='hollow-fibre-dialyzer');
 for(const id of ['reference','b-braun-diacap-pro-13h','baxter-prismaflex-hf1000','baxter-prismaflex-hf1400','nipro-elisio-17h','medtronic-hcd-015'])assert.ok(C.applicable(C.find(id)),id);
});
test('out-of-band observations remain eligible and visible in downloadable audit',()=>{
 const fs=require('node:fs'),csv=fs.readFileSync(require('node:path').join(__dirname,'../docs/catalog-clearance-audit.csv'),'utf8');
 for(const id of ['nipro-sureflux-03l','baxter-prismaflex-st60']){const f=C.find(id),bad=C.comparable(f).filter(b=>Math.abs(100*(D.predict(C.properties(D,id,b.qb),'water',b.qd).kWater/b.k-1))>10);assert.ok(bad.length);assert.ok(csv.includes(id));}
});

test('downloadable audit omits local source paths and workbook provenance',()=>{const csv=require('node:fs').readFileSync(require('node:path').join(__dirname,'../docs/catalog-clearance-audit.csv'),'utf8');const header=csv.split('\n')[0];for(const key of ['source','mediumProvenance','assumedProperties'])assert.ok(!header.includes('"'+key+'"'));assert.ok(!/\.pdf|\.xlsb|OneDrive|\/workspace\//i.test(csv));});


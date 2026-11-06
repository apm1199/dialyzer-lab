const {test}=require('node:test'),assert=require('node:assert/strict'),D=require('../docs/design.js'),T=require('../docs/transport-metrics.js');
test('global groups reconstruct the final clearance with the correct aqueous carrier basis',()=>{for(const fluid of ['water','blood'])for(const qd of [17.5,66.67,100,133.33,500]){const r=D.predict({},fluid,qd),m=T.fromResult(r);assert.ok(Math.abs(T.effectiveness(m.ntu,m.capacityRatio)-m.effectiveness)<1e-10);assert.equal(m.extraction,r.kWater/r.qw);assert.equal(m.effectiveness,r.kWater/Math.min(r.qw,qd));assert.equal(m.equivalentKoa_mLmin,r.koa);assert.ok(m.effectiveness>=0&&m.effectiveness<=1);}});
test('equal-flow and zero-flow groups avoid singularities or invented values',()=>{assert.equal(T.effectiveness(2,1),2/3);const m=T.fromResult(D.predict({},'water',0));assert.equal(m.ntu,null);assert.equal(m.effectiveness,null);assert.equal(m.extraction,0);assert.equal(m.barrierPe,null);assert.throws(()=>T.effectiveness(-1,.5));});
test('local Peclet is the signed solvent flux over local equivalent permeability',()=>{const r=D.predict(D.designDefaults,'water',100),h=r.hydraulics;assert.equal(h.PeBarrier.length,D.defaults.cells);assert.ok(h.PeBarrier.some(x=>x>0));assert.ok(h.PeBarrier.some(x=>x<0));for(let i=0;i<h.PeBarrier.length;i++)assert.ok(Math.abs(h.PeBarrier[i]-h.Jv_ms[i]/h.barrierPermeability_ms[i])<1e-12);});
test('manufacturer K0A comparison requires matched aqueous zero-UF conditions and cannot feed back into prediction',()=>{const r=D.predict({},'water',100),before=JSON.stringify(r),conditions={qb:100,qd:100,qf:0,medium:'saline'};assert.equal(T.compareKoa(r,100,conditions,'water').matched,true);assert.equal(T.compareKoa(r,100,{...conditions,qf:10},'water').matched,false);assert.equal(T.compareKoa(r,100,{...conditions,qb:200},'water').matched,false);assert.equal(T.compareKoa(r,100,{...conditions,medium:'blood'},'water').matched,false);assert.equal(T.compareKoa(r,100,conditions,'blood').matched,false);assert.equal(T.compareKoa(r,'',conditions,'water'),null);T.compareKoa(r,99999,conditions,'water');assert.equal(JSON.stringify(r),before);assert.equal(D.predict({},'water',100).kWater,r.kWater);});
test('module hydraulic conductance uses the cylindrical permeance and actual inner area, even at zero flow',()=>{
 const input={Lp:312,hydraulicBasis:'inner-area',fiberCount:12000,length_mm:270,diameter_um:215};
 const expected=312*Math.PI*215e-6*.270*12000;
 for(const qd of [0,500]){
  const result=D.predict(input,'water',qd);
  assert.ok(Math.abs(T.fromResult(result).moduleConductance_mL_h_mmHg-expected)<1e-9);
 }
 const planar=D.geometry(D.defaults);
 assert.ok(Math.abs(T.fromResult(D.predict({},'water',0)).moduleConductance_mL_h_mmHg-D.defaults.Lp*planar.area*(planar.ro-planar.ri)/planar.lc)<1e-9);
});

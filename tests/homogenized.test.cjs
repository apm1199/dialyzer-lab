const {test}=require('node:test');
const assert=require('node:assert/strict');
const H=require('../docs/homogenized.js');
const D=require('../docs/design.js');
test('bundle resistance meets the CFD anchor, blends in UF and decays at high Qd',()=>{
 const zero=H.resistance(300,500,0),ten=H.resistance(300,500,10);
 assert.ok(Math.abs(zero-39782.223)<1e-8);
 assert.ok(Math.abs(H.resistance(300,500,5)-(zero+ten)/2)<1e-8);
 assert.equal(H.resistance(300,500,15),ten);
 assert.equal(H.resistance(300,0,0),Infinity);
 assert.ok(H.resistance(300,2000,0)<zero);
});
test('shared solver holds hydraulic results across resistance laws and conserves imposed UF',()=>{
 const p={feedFlow_mLmin:300},qd=500;
 const original=D.predict(p,'water',qd);
 const updated=D.predict(p,'water',qd,.885,{resistance:H.resistance(300,qd,0)});
 assert.notEqual(original.kWater,updated.kWater);
 assert.equal(original.hydraulics.forward_mLmin,updated.hydraulics.forward_mLmin);
 for(const q of [0,500]){
  const result=D.predict(p,'water',q,.885,{uf:10,resistance:H.resistance(300,q,10)});
  assert.ok(Math.abs(result.hydraulics.net_mLmin-10)<1e-8);
  assert.ok(result.hydraulics.massBalanceRelative<1e-8);
 }
});

test('low-flow smooth fit stays within 0.35 mL/min of HF1000 manufacturer anchors and joins the Phylther branch monotonically',()=>{
 const C=require('../docs/catalog-water.js');
 const id='baxter-prismaflex-hf1000';
 for(const b of C.comparable(C.find(id))){
  const r=H.resistance(b.qb,b.qd,0);
  const result=D.predict(C.properties(D,id,b.qb),'water',b.qd,.885,{resistance:r});
  assert.ok(Math.abs(result.kWater-b.k)<.35);
 }
 for(const qb of [100,200,300,400])for(const uf of [0,5,10]){
  let last=Infinity;
  for(let qd=1;qd<=1600;qd++){
   const r=H.resistance(qb,qd,uf);
   assert.ok(r>=0&&r<=last);
   last=r;
  }
  const r0=H.resistance(qb,500,uf);
  const left=(r0-H.resistance(qb,499.999,uf))/.001;
  const right=(H.resistance(qb,500.001,uf)-r0)/.001;
  assert.ok(Math.abs(left-right)<.01);
 }
});

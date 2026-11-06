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

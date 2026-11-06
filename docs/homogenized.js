(function(root){
'use strict';
const M=typeof module==='undefined'?root.DialyzerModel:require('./model.js');
const DM=6.9929e-10, LC=1e-4*Math.log(1.3);
const rows=[
 [0,200,45014.799],[0,300,39782.223],[0,400,40602.709],
 [10,200,40641.272],[10,300,39913.510],[10,400,40367.677]
];
// Smooth low-flow shape fitted to HF1000 inferred permeances at Qd
// 5, 17, 42, 67, 100 and 133. The linear exponent term fixes the CFD anchor.
const shapeAmplitude=.39983617, shapeFlow=61.01898623, shapePower=1.84343386;
const lowReferenceAnchor=rows[0][2];
const shape=qd=>-shapeAmplitude*Math.expm1(-Math.pow(qd/shapeFlow,shapePower));
const tailRate=(Math.log1p(LC/(DM*lowReferenceAnchor))-shape(500))/500;
function resistance(qb,qd,uf){
 if(qd===0)return Infinity;
 const intrinsic=LC/DM;
 const weight=Math.min(uf/10,1);
 const branchResistance=[0,10].map(anchorUf=>{
  const branch=rows.filter(r=>r[0]===anchorUf).sort((a,b)=>a[1]-b[1]);
  const nodes=branch.map(r=>r[1]);
  return M.interpolate(nodes,branch.map(r=>r[2]),Math.min(nodes.at(-1),Math.max(nodes[0],qb)));
 });
 const referenceRadd=(1-weight)*branchResistance[0]+weight*branchResistance[1];
 if(qd===500)return referenceRadd;
 return (referenceRadd/lowReferenceAnchor)*intrinsic/Math.expm1(shape(qd)+tailRate*qd);
}
const api={resistance};
if(typeof module!=='undefined')module.exports=api;else root.DialyzerHomogenized=api;
})(typeof window==='undefined'?globalThis:window);

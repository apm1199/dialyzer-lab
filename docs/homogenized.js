(function(root){
'use strict';
const M=typeof module==='undefined'?root.DialyzerModel:require('./model.js');
const DM=6.9929e-10, LC=1e-4*Math.log(1.3);
const rows=[
 [0,200,45014.799],[0,300,39782.223],[0,400,40602.709],
 [10,200,40641.272],[10,300,39913.510],[10,400,40367.677]
];
// HF1000 at Qb=100, water and UF=0. Invert shared-solver clearance at
// manufacturer Qd=17/42/67/133; Qd=5/100 retain equivalent-fibre checks.
const lowFlows=[0,5,17,42,67,100,133,500];
const lowResistance=[Infinity,5165398.927584797,918811.435521631,190791.85989914899,
 102411.7103660668,80158.91556183265,62822.63965028817];
const lowReferenceAnchor=rows[0][2];
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
 const transfer=referenceRadd/lowReferenceAnchor;
 const permeance=[...lowResistance.map(r=>1/(intrinsic+transfer*r)),1/(intrinsic+referenceRadd)];
 const last=permeance.at(-1);
 const slope=(last-permeance.at(-2))/(500-lowFlows.at(-2));
 if(qd<=500){
  const slopes=M.pchipSlopes(lowFlows,permeance);
  slopes[slopes.length-1]=slope;
  return 1/M.interpolate(lowFlows,permeance,qd,slopes)-intrinsic;
 }
 const scale=referenceRadd*last*last/slope;
 return referenceRadd*Math.exp(-(qd-500)/scale);
}
const api={resistance};
if(typeof module!=='undefined')module.exports=api;else root.DialyzerHomogenized=api;
})(typeof window==='undefined'?globalThis:window);

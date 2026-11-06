(function(root){
'use strict';
const M=typeof module==='undefined'?root.DialyzerModel:require('./model.js');
const DM=6.9929e-10, LC=1e-4*Math.log(1.3);
const rows=[
 [0,200,45014.799],[0,300,39782.223],[0,400,40602.709],
 [10,200,40641.272],[10,300,39913.510],[10,400,40367.677]
];
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
 const at500=1/(intrinsic+referenceRadd);
 if(qd<=500)return 1/M.interpolate([0,500],[0,at500],qd)-intrinsic;
 const scale=500*referenceRadd/(intrinsic+referenceRadd);
 return referenceRadd*Math.exp(-(qd-500)/scale);
}
const api={resistance};
if(typeof module!=='undefined')module.exports=api;else root.DialyzerHomogenized=api;
})(typeof window==='undefined'?globalThis:window);

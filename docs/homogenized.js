(function(root){
'use strict';
const M=typeof module==='undefined'?root.DialyzerModel:require('./model.js');
const F=1e-6/60, MMHG=133.322387415, DM=6.9929e-10, MU=1.00299136e-3;
function requireValue(ok,message){if(!ok)throw Error(message);}
// UF, module inlet flow, additional resistance, calibrated CFD clearance.
const calibration={shellK:3.7667166684075203e-10,areaDensity:5607.114060802348,rows:[
 [0,200,45014.799,197.011],[0,300,39782.223,277.000],[0,400,40602.709,328.961],
 [10,200,40641.272,198.004],[10,300,39913.510,279.001],[10,400,40367.677,332.991]
]};
const referencePreset={
 fibres:11200,area:calibration.areaDensity*Math.PI*.02**2*.241,housing:40,
 caseLength:305,length:241,bore:200,wall:30,lp:31.68,shellK:calibration.shellK
};
function catalogPreset(C,D,id){
 const p=C.properties(D,id),g=D.geometry(p);
 return {
  fibres:p.fiberCount||Math.round(g.nf),area:g.area,housing:p.shellDiameter_mm,
  caseLength:p.totalLength_mm||0,length:p.length_mm,bore:p.diameter_um,wall:p.thickness_um,
  lp:g.lpCyl*3600*MMHG/1e-6,shellK:calibration.shellK
 };
}
function predict(p,cal=calibration,cells=240){
 const {qb,qd,uf,area,fibres,bore,wall,housing,length,caseLength,lp,shellK}=p;
 requireValue(Object.values(p).every(Number.isFinite)&&uf>=0&&qb>uf&&qd>=0&&[area,fibres,bore,wall,housing,length,lp,shellK].every(x=>x>0)&&Number.isInteger(fibres)&&(caseLength===0||caseLength>=length),'Enter positive geometry and hydraulic properties, 0 ≤ UF < Qb, Qd ≥ 0 and, if supplied, an overall length at least as large as active length.');
 const ri=bore*5e-7,ro=ri+wall*1e-6,R=housing/2000,L=length/1000,S=Math.PI*R*R;
 const eb=fibres*(ri/R)**2,ed=1-fibres*(ro/R)**2;
 requireValue(eb>0&&ed>0,'The fibres do not fit inside the housing.');
 const geometricArea=fibres*2*Math.PI*ri*L;
 const activeArea=area;
 const intrinsic=ri*Math.log(ro/ri)/DM;
 const weight=Math.min(uf/10,1);
 const branchResistance=[0,10].map(anchorUf=>{
  const branch=cal.rows.filter(r=>r[0]===anchorUf).sort((a,b)=>a[1]-b[1]);
  const nodes=branch.map(r=>r[1]);
  return M.interpolate(nodes,branch.map(r=>r[2]),Math.min(nodes.at(-1),Math.max(nodes[0],qb)));
 });
 const referenceRadd=(1-weight)*branchResistance[0]+weight*branchResistance[1];
 const at500=1/(intrinsic+referenceRadd), limit=1/intrinsic;
 // Two-knot PCHIP is linear. Match its terminal slope to an exponential tail.
 const permeance=qd<=500?M.interpolate([0,500],[0,at500],qd):limit-(limit-at500)*Math.exp(-(qd-500)*at500/(500*(limit-at500)));
 const rm=permeance>0?1/permeance:null,radd=rm===null?null:rm-intrinsic;
 const result={rm,radd,referenceRadd,geometricArea,activeArea,eb,ed,areaDensity:activeArea/(S*L),diffusivePermeance:permeance,anchor:cal.rows.find(r=>r[0]===uf&&r[1]===qb&&qd===500)||null};
 if(qd===0&&uf===0)return {...result,clearance:0,forward:null,back:null};
 const cbResistance=MU/(eb*ri*ri/8*S),cdResistance=MU/(shellK*S);
 const exchange=lp*1e-6/3600/MMHG*activeArea/L;
 const wave=Math.sqrt(exchange*(cbResistance+cdResistance))*L;
 const equilibrium=-cdResistance/(cbResistance+cdResistance)*(qd-qb+uf);
 const left=qb-equilibrium,right=qb-uf-equilibrium;
 const shape=t=>Math.exp((t-1)*wave)*(-Math.expm1(-2*t*wave))/(-Math.expm1(-2*wave));
 const b=Array.from({length:cells+1},(_,i)=>{const t=i/cells;return equilibrium+left*shape(1-t)+right*shape(t);});
 b[0]=qb;b[cells]=qb-uf;
 const d=b.map(q=>qd+q-(qb-uf));
 d[cells]=qd;
 requireValue(Math.min(...b)>0,'The model predicts lumen flow reversal. This operating point is outside the supported range.');
 const upper=[],sol=[];
 let forward=0,back=0;
 const gb=eb*1.9e-9*S/(L/cells)/F,gd=ed*1.9e-9*S/(L/cells)/F;
 const diff=activeArea*permeance/(cells*F);
 for(let i=0;i<cells;i++){
  const j=b[i]-b[i+1];forward+=Math.max(j,0);back+=Math.max(-j,0);
  const ab=diff+Math.max(j,0),ad=diff+Math.max(-j,0);
  const gl=i?gb:0,gr=i<cells-1?gb:0,hl=i?gd:0,hr=i<cells-1?gd:0;
  let a=b[i+1]+ab+gl+gr,c=-ab,e=-ad,f=Math.max(d[i],0)+Math.max(-d[i+1],0)+ad+hl+hr;
  let u=i===0?qb:0,v=0;
  if(i){
   const [x1,x2,x3,x4]=upper[i-1], [y1,y2]=sol[i-1], lb=-b[i]-gl,ld=-Math.max(-d[i],0)-hl;
   a-=lb*x1;e-=lb*x2;c-=ld*x3;f-=ld*x4;u-=lb*y1;v-=ld*y2;
  }
  const det=a*f-e*c;
  requireValue(Number.isFinite(det)&&det>0,'Singular solute balance.');
  const ub=-gr,ud=i<cells-1?-Math.max(d[i+1],0)-hr:0;
  upper.push([f*ub/det,-e*ud/det,-c*ub/det,a*ud/det]);
  sol.push([(f*u-e*v)/det,(a*v-c*u)/det]);
 }
 const outletLumen=sol.at(-1)[0];
 let [x,y]=sol.at(-1);
 for(let i=cells-2;i>=0;i--){
  const [a,b,c,d]=upper[i], [u,v]=sol[i];
  [x,y]=[u-a*x-b*y,v-c*x-d*y];
 }
 const clearance=d[0]*y;
 requireValue(Number.isFinite(clearance)&&clearance>=0&&Math.abs(clearance-(qb-b[cells]*outletLumen))<1e-6*qb,'The urea mass balance did not close.');
 return {...result,clearance,forward,back};
}
const api={referencePreset,catalogPreset,predict};
if(typeof module!=='undefined')module.exports=api;else root.DialyzerHomogenized=api;
})(typeof window==='undefined'?globalThis:window);

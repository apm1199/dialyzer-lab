/* Dialyzer Lab. Pure numerical functions; no DOM or dependencies. */
(function(root){
'use strict';
const FLOW=1e-6/60;
const geometry={ri:1.076024136551e-4,ro:1.576500479132e-4,length:.218,fibers:7500,lc:4.109708596949e-5};
geometry.area=2*Math.PI*geometry.ri*geometry.length*geometry.fibers;
const dappNodes={x:[0,17.5,41.67,66.67,133.33],y:[0,4.326898176908e-11,1.8326875e-10,2.56355e-10,3.250668012693e-10]};
const presets={water:{name:'Water · default transport model',qb:100,fw:1,fluid:'water',correlationModel:true,source:'Model informed by literature and numerical datasets.',rows:[[17.5,17],[41.67,41],[66.67,62],[100,78],[133.33,88]],checks:[[5,4.66]]},blood:{name:'Blood · default transport model',qb:100,fw:.8565,fluid:'blood',correlationModel:true,source:'Model informed by literature and numerical datasets.',rows:[[41.67,40.47],[66.67,58.71],[100,71.01],[133.33,76.53]],checks:[]}};
function need(v,msg){if(!v)throw Error(msg);}
function finite(x){return Number.isFinite(x);}
function koaFromK(k,qw,qd){
 need([k,qw,qd].every(finite)&&qw>0&&qd>0&&k>0&&k<Math.min(qw,qd),'Clearance must lie strictly between 0 and min(Qwater, Qd).');
 const a=Math.min(qw,qd),b=Math.max(qw,qd),r=a/b;
 if(Math.abs(1-r)<1e-8)return a*k/(a-k);
 const e=k/a;return -a/(1-r)*Math.log((1-e)/(1-r*e));
}
function kFromKoa(koa,qw,qd){
 need([koa,qw,qd].every(finite)&&koa>=0&&qw>0&&qd>0,'Positive flows and non-negative KoA are required.');
 const a=Math.min(qw,qd),b=Math.max(qw,qd),r=a/b;
 if(Math.abs(1-r)<1e-8)return a*koa/(a+koa);
 const z=-Math.expm1(-koa/a*(1-r));return a*z/(1-r+r*z);
}
function pchipSlopes(x,y){
 const n=x.length,h=[],s=[],m=Array(n).fill(0);
 for(let i=0;i<n-1;i++){h[i]=x[i+1]-x[i];s[i]=(y[i+1]-y[i])/h[i];}
 if(n===2)return [s[0],s[0]];
 for(let i=1;i<n-1;i++)if(s[i-1]*s[i]>0){let w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/s[i-1]+w2/s[i]);}
 function end(h0,h1,s0,s1){let v=((2*h0+h1)*s0-h0*s1)/(h0+h1);if(v*s0<=0)return 0;if(s0*s1<0&&Math.abs(v)>3*Math.abs(s0))return 3*s0;return v;}
 m[0]=end(h[0],h[1],s[0],s[1]);m[n-1]=end(h[n-2],h[n-3],s[n-2],s[n-3]);return m;
}
function interpolate(x,y,q,slopes=null){
 need(x.length>=2&&x.length===y.length,'At least two nodes are required.');
 const tolerance=1e-12*Math.max(1,Math.abs(x[0]),Math.abs(x.at(-1)));
 need(finite(q)&&q>=x[0]-tolerance&&q<=x.at(-1)+tolerance,'Flow outside the data domain: extrapolation is disabled.');
 q=Math.max(x[0],Math.min(x.at(-1),q));
 const m=slopes||pchipSlopes(x,y);let i=0;while(i<x.length-2&&q>x[i+1])i++;
 const h=x[i+1]-x[i],t=(q-x[i])/h;
 return (2*t**3-3*t*t+1)*y[i]+(t**3-2*t*t+t)*h*m[i]+(-2*t**3+3*t*t)*y[i+1]+(t**3-t*t)*h*m[i+1];
}
function validateDataset(d){
 need(d&&finite(d.qb)&&d.qb>0&&finite(d.fw)&&d.fw>0&&d.fw<=1,'Invalid dataset metadata.');
 need(Array.isArray(d.rows)&&d.rows.length>=2,'At least two operating conditions are required.');
 const rows=d.rows.map(r=>[Number(r[0]),Number(r[1])]).sort((a,b)=>a[0]-b[0]);
 rows.forEach((r,i)=>{koaFromK(r[1],d.qb*d.fw,r[0]);need(!i||r[0]>rows[i-1][0],'Duplicate flows: aggregate replicates before importing.');});
 return {...d,rows};
}
function effectiveDapp(qd){
 need(finite(qd)&&qd>=0&&qd<=133.33+1e-10,'Model domain: 0 to 133.33 mL/min.');
 const {x,y}=dappNodes,m=pchipSlopes(x,y);m[m.length-1]=(y.at(-1)-y.at(-2))/(x.at(-1)-x.at(-2));
 return interpolate(x,y,Math.min(133.33,qd),m);
}
function transportNodes(d){
 const qw=d.qb*d.fw;
 return d.rows.map(([q,k])=>{
  const koa=koaFromK(k,qw,q),membraneKoa=geometry.area*effectiveDapp(q)/geometry.lc/FLOW;
  return [q,koa/membraneKoa];
 });
}
function domain(d){return d.correlationModel?[0,133.33]:[d.rows[0][0],d.rows.at(-1)[0]];}
function predict(dataset,qd,cBulk=.885){
 const d=validateDataset(dataset);need(finite(cBulk)&&cBulk>0,'A positive inlet concentration is required.');
 const [lo,hi]=domain(d);need(finite(qd)&&qd>=lo-1e-10&&qd<=hi+1e-10,'Flow outside the supported model domain.');
 qd=Math.max(lo,Math.min(hi,qd));const qw=d.qb*d.fw,cw=cBulk/d.fw;
 let koa,dapp=null,rm=null,factor=null;
 if(d.correlationModel){
  dapp=effectiveDapp(qd);
  const nodes=transportNodes(d),qnode=Math.max(nodes[0][0],Math.min(nodes.at(-1)[0],qd));
  factor=interpolate(nodes.map(r=>r[0]),nodes.map(r=>r[1]),qnode);
  // Below the first reference, hold the identified equivalent transport factor fixed.
  // This continuation is a reduced-model assumption, not an additional resolved flow calculation.
  if(qd===0){rm=null;koa=0;}else{rm=geometry.lc/dapp;koa=factor*geometry.area/rm/FLOW;}
 }else{
  const x=d.rows.map(r=>r[0]),y=d.rows.map(r=>koaFromK(r[1],qw,r[0]));koa=interpolate(x,y,qd);
 }
 const k=qd===0?0:kFromKoa(koa,qw,qd);
 const status=qd===0?'Zero-flow limit':d.correlationModel&&qd<d.rows[0][0]?'Low-flow model prediction':d.correlationModel?'Reduced-model prediction':'Imported-data interpolation';
 return {qd,qb:d.qb,qw,koa,kWater:k,kBulk:k/d.fw,cWaterIn:cw,cWaterOut:cw*(1-k/qw),cBulkOut:cBulk*(1-k/qw),cDialysateOut:qd===0?null:k*cw/qd,removal_mgmin:k*cw,netUF:0,dapp,membraneResistance_s_m:rm,equivalentFactor:factor,status,source:d.source};
}
function crossValidate(dataset){
 const d=validateDataset(dataset),points=[];
 // Endpoints cannot be held out without extrapolation. Test interior nodes only.
 for(let i=1;i<d.rows.length-1;i++){const train={...d,rows:d.rows.filter((_,j)=>j!==i)};const pred=predict(train,d.rows[i][0]).kWater;points.push({qd:d.rows[i][0],observed:d.rows[i][1],predicted:pred,error:pred-d.rows[i][1]});}
 return {points,rmse:points.length?Math.sqrt(points.reduce((s,r)=>s+r.error*r.error,0)/points.length):null};
}
function parseCSV(text){
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(x=>x.trim());need(lines.length>1,'Empty CSV file.');
 const sep=lines[0].includes(';')?';':',';
 const header=lines[0].split(sep).map(x=>x.trim().toLowerCase());need(new Set(header).size===header.length,'Duplicate column headers.');
 const rows=lines.slice(1).map((line,i)=>{const v=line.split(sep).map(x=>x.trim());need(v.length===header.length,`Row ${i+2}: incorrect number of columns.`);let r={};header.forEach((h,j)=>{let raw=v[j];if(sep===';')raw=raw.replace(',','.');need(raw!==''&&finite(Number(raw)),`Row ${i+2}: missing or invalid numerical value.`);r[h]=Number(raw);});return r;});
 need(rows.length<=5000,'Maximum 5000 rows.');return {header,rows};
}
function importSteady(text,meta){
 const csv=parseCSV(text);need(['qd_mlmin','clearance_water_mlmin'].every(h=>csv.header.includes(h)),'Required columns: qd_mlmin, clearance_water_mlmin.');
 if(csv.header.includes('qb_mlmin'))need(csv.rows.every(r=>Math.abs(r.qb_mlmin-meta.qb)<1e-8),'CSV Qb differs from the metadata. Split the datasets.');
 if(csv.header.includes('uf_net_mlmin'))need(csv.rows.every(r=>Math.abs(r.uf_net_mlmin)<1e-8),'This model supports zero net ultrafiltration only.');
 return validateDataset({...meta,correlationModel:false,rows:csv.rows.map(r=>[r.qd_mlmin,r.clearance_water_mlmin])});
}
function membrane(p){
 ['thickness_um','Lp','mu','area','D','eps','tau'].forEach(k=>need(finite(p[k])&&p[k]>0,'Positive physical parameters are required.'));
 need(p.eps<=1,'Porosity must not exceed 1.');const lp=p.Lp*1e-6/3600/133.322387415,delta=p.thickness_um*1e-6;
 return {darcy:lp*p.mu*delta,Deff:p.D*p.eps/p.tau,membraneKoa:p.area*p.D*p.eps/p.tau/delta/FLOW};
}
function stepResponse(times,{y0,gain,du,tStep,tau,delay}){
 need(tau>0&&delay>=0&&[y0,gain,du,tStep,tau,delay].every(finite),'Invalid dynamic parameters.');
 return times.map(t=>y0+gain*du*(-Math.expm1(-Math.max(0,t-tStep-delay)/tau)));
}
function identifyStep(text){
 const csv=parseCSV(text);need(['time_s','input','output'].every(h=>csv.header.includes(h)),'Required columns: time_s, input, output.');const r=csv.rows;
 need(r.length>=16,'At least 16 samples are required.');r.forEach((v,i)=>need(!i||v.time_s>r[i-1].time_s,'Time must be strictly increasing.'));
 const u0=r[0].input,tol=1e-6*Math.max(1,...r.map(v=>Math.abs(v.input)));
 const j=r.findIndex(v=>Math.abs(v.input-u0)>tol);need(j>=3&&r.length-j>=10,'At least 3 pre-step and 10 post-step samples are required.');
 const u1=r[j].input;need(r.slice(j).every(v=>Math.abs(v.input-u1)<=tol),'Only one step followed by a constant input is supported.');
 const y0=r.slice(0,j).reduce((s,v)=>s+v.output,0)/j,du=u1-u0,tStep=r[j].time_s;
 const split=j+Math.max(7,Math.floor((r.length-j)*.7)),train=r.slice(j,split),hold=r.slice(split),span=train.at(-1).time_s-tStep;
 need(span>0&&hold.length>=3,'The series is too short to separate estimation and checking.');let best=null;
 for(let it=0;it<100;it++){
  const tau=span*.005*Math.exp(it/99*Math.log(1000));
  for(let id=0;id<=60;id++){
   const delay=span*.6*id/60;let numerator=0,denom=0;
   for(const v of train){const z=-Math.expm1(-Math.max(0,v.time_s-tStep-delay)/tau);numerator+=z*(v.output-y0);denom+=z*z;}
   if(denom<1e-20)continue;const amplitude=numerator/denom;let sse=0;
   for(const v of train){const z=-Math.expm1(-Math.max(0,v.time_s-tStep-delay)/tau);sse+=(v.output-y0-amplitude*z)**2;}
   if(!best||sse<best.sse)best={tau,delay,gain:amplitude/du,y0,du,tStep,sse};
  }
 }
 need(best&&Math.abs(best.gain*du)>1e-12,'Insufficient output response to identify the model.');
 const fitted=stepResponse(r.map(v=>v.time_s),best);let err=0;
 for(let i=split;i<r.length;i++)err+=(r[i].output-fitted[i])**2;
 return {...best,rmseTrain:Math.sqrt(best.sse/train.length),rmseHoldout:Math.sqrt(err/hold.length),split,rows:r,fitted,source:'Grid-based identification; final samples excluded from fitting; no confidence intervals.'};
}
const api={geometry,dappNodes,effectiveDapp,transportNodes,domain,presets,koaFromK,kFromKoa,interpolate,validateDataset,predict,crossValidate,parseCSV,importSteady,membrane,stepResponse,identifyStep};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DialyzerModel=api;
})(typeof window!=='undefined'?window:globalThis);

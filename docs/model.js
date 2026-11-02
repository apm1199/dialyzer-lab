/* Dialyzer Lab. Pure numerical functions; no DOM or dependencies. */
(function(root){
'use strict';
const FLOW=1e-6/60;
const paper={water:{name:'Acqua · riferimenti del paper',qb:100,fw:1,fluid:'water',source:'Paper_APM - draft.pdf, Table 4. 41, 62, 88: manufacturer reference targets; 78: aqueous comparison, not a manufacturer specification. Not raw experimental samples.',rows:[[41.67,41],[66.67,62],[100,78],[133.33,88]]},blood:{name:'Sangue · previsioni CFD del paper',qb:100,fw:.8565,fluid:'blood',source:'Paper_APM - draft.pdf, Table 4. CFD predictions, blood-water-referenced clearance; Hct=.35, plasma water=.93, RBC water=.72, Carreau-Yasuda. Not experimental blood data.',rows:[[41.67,40.47],[66.67,58.71],[100,71.01],[133.33,76.53]]}};
function need(v,msg){if(!v)throw Error(msg);}
function finite(x){return Number.isFinite(x);}
function koaFromK(k,qw,qd){
 need([k,qw,qd].every(finite)&&qw>0&&qd>0&&k>0&&k<Math.min(qw,qd),'Clearance richiesta tra 0 e min(Qacqua,Qd), estremi esclusi.');
 const a=Math.min(qw,qd),b=Math.max(qw,qd),r=a/b;
 if(Math.abs(1-r)<1e-8)return a*k/(a-k);
 const e=k/a;return -a/(1-r)*Math.log((1-e)/(1-r*e));
}
function kFromKoa(koa,qw,qd){
 need([koa,qw,qd].every(finite)&&koa>=0&&qw>0&&qd>0,'Portate positive e KoA non negativo richiesti.');
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
function interpolate(x,y,q){
 need(x.length>=2&&x.length===y.length,'Almeno due nodi richiesti.');
 const tolerance=1e-12*Math.max(1,Math.abs(x[0]),Math.abs(x.at(-1)));
 need(finite(q)&&q>=x[0]-tolerance&&q<=x.at(-1)+tolerance,'Portata fuori dal dominio dei dati: estrapolazione disabilitata.');
 q=Math.max(x[0],Math.min(x.at(-1),q));
 const m=pchipSlopes(x,y);let i=0;while(i<x.length-2&&q>x[i+1])i++;
 const h=x[i+1]-x[i],t=(q-x[i])/h;
 return (2*t**3-3*t*t+1)*y[i]+(t**3-2*t*t+t)*h*m[i]+(-2*t**3+3*t*t)*y[i+1]+(t**3-t*t)*h*m[i+1];
}
function validateDataset(d){
 need(d&&finite(d.qb)&&d.qb>0&&finite(d.fw)&&d.fw>0&&d.fw<=1,'Metadati dataset non validi.');
 need(Array.isArray(d.rows)&&d.rows.length>=2,'Servono almeno due condizioni.');
 const rows=d.rows.map(r=>[Number(r[0]),Number(r[1])]).sort((a,b)=>a[0]-b[0]);
 rows.forEach((r,i)=>{koaFromK(r[1],d.qb*d.fw,r[0]);need(!i||r[0]>rows[i-1][0],'Portate duplicate: aggregare le repliche prima dell’importazione.');});
 return {...d,rows};
}
function predict(dataset,qd,cBulk=.885){
 const d=validateDataset(dataset);need(finite(cBulk)&&cBulk>0,'Concentrazione positiva richiesta.');
 const qw=d.qb*d.fw,x=d.rows.map(r=>r[0]),y=d.rows.map(r=>koaFromK(r[1],qw,r[0]));
 const koa=interpolate(x,y,qd),k=kFromKoa(koa,qw,qd),cw=cBulk/d.fw;
 return {qd,qb:d.qb,qw,koa,kWater:k,kBulk:k/d.fw,cWaterIn:cw,cWaterOut:cw*(1-k/qw),cBulkOut:cBulk*(1-k/qw),cDialysateOut:k*cw/qd,removal_mgmin:k*cw,netUF:0,source:d.source};
}
function crossValidate(dataset){
 const d=validateDataset(dataset),points=[];
 // Endpoints cannot be held out without extrapolation. Test interior nodes only.
 for(let i=1;i<d.rows.length-1;i++){const train={...d,rows:d.rows.filter((_,j)=>j!==i)};const pred=predict(train,d.rows[i][0]).kWater;points.push({qd:d.rows[i][0],observed:d.rows[i][1],predicted:pred,error:pred-d.rows[i][1]});}
 return {points,rmse:points.length?Math.sqrt(points.reduce((s,r)=>s+r.error*r.error,0)/points.length):null};
}
function parseCSV(text){
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(x=>x.trim());need(lines.length>1,'CSV vuoto.');
 const sep=lines[0].includes(';')?';':',';
 const header=lines[0].split(sep).map(x=>x.trim().toLowerCase());need(new Set(header).size===header.length,'Intestazioni duplicate.');
 const rows=lines.slice(1).map((line,i)=>{const v=line.split(sep).map(x=>x.trim());need(v.length===header.length,`Riga ${i+2}: numero di colonne non valido.`);let r={};header.forEach((h,j)=>{let raw=v[j];if(sep===';')raw=raw.replace(',','.');need(raw!==''&&finite(Number(raw)),`Riga ${i+2}: valore numerico mancante o non valido.`);r[h]=Number(raw);});return r;});
 need(rows.length<=5000,'Massimo 5000 righe.');return {header,rows};
}
function importSteady(text,meta){
 const csv=parseCSV(text);need(['qd_mlmin','clearance_water_mlmin'].every(h=>csv.header.includes(h)),'Colonne richieste: qd_mlmin, clearance_water_mlmin.');
 if(csv.header.includes('qb_mlmin'))need(csv.rows.every(r=>Math.abs(r.qb_mlmin-meta.qb)<1e-8),'Qb nel CSV diverso dai metadati. Separare i dataset.');
 if(csv.header.includes('uf_net_mlmin'))need(csv.rows.every(r=>Math.abs(r.uf_net_mlmin)<1e-8),'Questo modello supporta soltanto UF netta nulla.');
 return validateDataset({...meta,rows:csv.rows.map(r=>[r.qd_mlmin,r.clearance_water_mlmin])});
}
function membrane(p){
 ['thickness_um','Lp','mu','area','D','eps','tau'].forEach(k=>need(finite(p[k])&&p[k]>0,'Parametri fisici positivi richiesti.'));
 need(p.eps<=1,'Porosità <=1 richiesta.');const lp=p.Lp*1e-6/3600/133.322387415,delta=p.thickness_um*1e-6;
 return {darcy:lp*p.mu*delta,Deff:p.D*p.eps/p.tau,membraneKoa:p.area*p.D*p.eps/p.tau/delta/FLOW};
}
function stepResponse(times,{y0,gain,du,tStep,tau,delay}){
 need(tau>0&&delay>=0&&[y0,gain,du,tStep,tau,delay].every(finite),'Parametri dinamici non validi.');
 return times.map(t=>y0+gain*du*(-Math.expm1(-Math.max(0,t-tStep-delay)/tau)));
}
function identifyStep(text){
 const csv=parseCSV(text);need(['time_s','input','output'].every(h=>csv.header.includes(h)),'Colonne richieste: time_s, input, output.');const r=csv.rows;
 need(r.length>=16,'Servono almeno 16 campioni.');r.forEach((v,i)=>need(!i||v.time_s>r[i-1].time_s,'Tempi strettamente crescenti richiesti.'));
 const u0=r[0].input,tol=1e-6*Math.max(1,...r.map(v=>Math.abs(v.input)));
 const j=r.findIndex(v=>Math.abs(v.input-u0)>tol);need(j>=3&&r.length-j>=10,'Servono almeno 3 campioni prima e 10 dopo un singolo gradino.');
 const u1=r[j].input;need(r.slice(j).every(v=>Math.abs(v.input-u1)<=tol),'Supportato un solo gradino, seguito da ingresso costante.');
 const y0=r.slice(0,j).reduce((s,v)=>s+v.output,0)/j,du=u1-u0,tStep=r[j].time_s;
 const split=j+Math.max(7,Math.floor((r.length-j)*.7)),train=r.slice(j,split),hold=r.slice(split),span=train.at(-1).time_s-tStep;
 need(span>0&&hold.length>=3,'Serie troppo corta per separare stima e verifica.');let best=null;
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
 need(best&&Math.abs(best.gain*du)>1e-12,'Risposta insufficiente a identificare il modello.');
 const fitted=stepResponse(r.map(v=>v.time_s),best);let err=0;
 for(let i=split;i<r.length;i++)err+=(r[i].output-fitted[i])**2;
 return {...best,rmseTrain:Math.sqrt(best.sse/train.length),rmseHoldout:Math.sqrt(err/hold.length),split,rows:r,fitted,source:'Identificazione numerica a griglia; parte finale esclusa dalla stima; nessun intervallo di confidenza.'};
}
const api={paper,koaFromK,kFromKoa,interpolate,validateDataset,predict,crossValidate,parseCSV,importSteady,membrane,stepResponse,identifyStep};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DialyzerModel=api;
})(typeof window!=='undefined'?window:globalThis);

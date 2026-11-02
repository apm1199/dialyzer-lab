'use strict';
const M=window.DialyzerModel,$=id=>document.getElementById(id);
let custom=null,last=null,dynamicResult=null;
const f=(x,n=2)=>Number(x).toLocaleString('it-IT',{minimumFractionDigits:n,maximumFractionDigits:n});
function safe(fn){return (...args)=>{try{$('status').hidden=true;return fn(...args);}catch(e){$('status').textContent=e.message;$('status').hidden=false;}};}
function download(name,content,type='text/plain'){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([content],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500);}
function dataset(){return custom||M.paper[$('fluid').value];}
function chart(target,series,points,{xLabel='Qd · mL/min',yLabel='Clearance · mL/min',split=null}={}){
 const all=[...series,...points];if(!all.length)return;
 const w=700,h=300,l=65,r=22,t=25,b=52;
 let xmin=Math.min(...all.map(p=>p[0])),xmax=Math.max(...all.map(p=>p[0])),ymin=Math.min(0,...all.map(p=>p[1])),ymax=Math.max(...all.map(p=>p[1]));
 if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;const pad=(ymax-ymin)*.1;ymax+=pad;if(ymin<0)ymin-=pad;
 const sx=x=>l+(x-xmin)/(xmax-xmin)*(w-l-r),sy=y=>h-b-(y-ymin)/(ymax-ymin)*(h-t-b);
 const el=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;};
 const svg=el('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':`${yLabel} in funzione di ${xLabel}`});
 for(let i=0;i<=4;i++){const y=ymin+(ymax-ymin)*i/4;svg.append(el('line',{x1:l,y1:sy(y),x2:w-r,y2:sy(y),stroke:'#e3e9e2'}));svg.append(el('text',{x:l-12,y:sy(y)+4,'text-anchor':'end'},f(y,1)));const x=xmin+(xmax-xmin)*i/4;svg.append(el('text',{x:sx(x),y:h-b+24,'text-anchor':'middle'},f(x,1)));}
 if(split!==null)svg.append(el('line',{x1:sx(split),x2:sx(split),y1:t,y2:h-b,stroke:'#b75b30','stroke-dasharray':'5 4'}));
 svg.append(el('path',{d:series.map((p,i)=>`${i?'L':'M'}${sx(p[0])},${sy(p[1])}`).join(' '),fill:'none',stroke:'#086655','stroke-width':2.7}));
 points.forEach(p=>svg.append(el('circle',{cx:sx(p[0]),cy:sy(p[1]),r:4,fill:'#b75b30',stroke:'white','stroke-width':1.5})));
 svg.append(el('text',{x:l,y:13},yLabel));svg.append(el('text',{x:(l+w-r)/2,y:h-6,'text-anchor':'middle'},xLabel));
 $(target).classList.remove('placeholder');$(target).replaceChildren(svg);
}
function tableRows(id,rows){$(id).replaceChildren(...rows.map(values=>{const tr=document.createElement('tr');values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});return tr;}));}
function updateData(){const d=dataset();$('datasetName').textContent=d.name;tableRows('dataRows',d.rows.map(r=>{const p=M.predict(d,r[0]);return[f(r[0]),f(r[1]),f(p.kWater),f(p.koa,1)];}));const cv=M.crossValidate(d);$('cv').textContent=cv.rmse===null?'Almeno tre punti necessari per verificare un nodo interno.':`RMSE sui punti esclusi: ${f(cv.rmse,3)} mL/min. Verifica interna del dataset, non validazione indipendente.`;tableRows('cvRows',cv.points.map(p=>[f(p.qd),f(p.observed),f(p.predicted),f(p.error,3)]));}
function updateStatic(){
 const d=dataset(),qd=Number($('qd').value),cin=Number($('cin').value);last=M.predict(d,qd,cin);
 const set=(id,val)=>$(id).textContent=val;
 set('k',f(last.kWater));set('koa',f(last.koa,1));set('removal',f(last.removal_mgmin,2));set('cb',f(last.cBulkOut,4)+' kg/m³');set('cd',f(last.cDialysateOut,4)+' kg/m³');set('kbulk',f(last.kBulk)+' mL/min');set('qb',f(d.qb,2)+' mL/min');set('qw',f(last.qw,2)+' mL/min');
 set('sourceTag',custom?'DATI IMPORTATI':'RIFERIMENTI PAPER');
 set('sourceNote',custom?`${d.name}. Dati importati dall’utente; filtro e condizioni devono corrispondere alla campagna. Nessuna validazione indipendente implicita.`:d.fluid==='water'?'Tabella 4 del paper: riferimenti acquosi 41, 62 e 88 mL/min; a Qd = 100 il valore 78 è un riferimento di confronto. Non sono misure sperimentali grezze.':'Tabella 4 del paper: previsioni CFD con sangue, Hct 35%, fw = 0,8565, reologia Carreau–Yasuda. Non sono misure sperimentali sul sangue.');
 const x0=d.rows[0][0],x1=d.rows.at(-1)[0],curve=Array.from({length:101},(_,i)=>{const q=x0+(x1-x0)*i/100;return [q,M.predict(d,q).kWater];});chart('staticChart',curve,d.rows);updateData();
}
function configure(){const d=dataset(),lo=d.rows[0][0],hi=d.rows.at(-1)[0];for(const id of ['qd','qdRange']){$(id).min=lo;$(id).max=hi;}let q=Number($('qd').value);if(!Number.isFinite(q))q=lo;q=Math.max(lo,Math.min(hi,q));$('qd').value=q;$('qdRange').value=q;$('minQ').textContent=f(lo);$('maxQ').textContent=f(hi);updateStatic();}
function membraneUpdate(){const p={thickness_um:Number($('thickness').value),Lp:Number($('lp').value),mu:Number($('mu').value),area:Number($('area').value),D:Number($('dbulk').value),eps:Number($('eps').value),tau:Number($('tortuosity').value)},r=M.membrane(p);$('darcy').textContent=r.darcy.toExponential(4)+' m²';$('deff').textContent=r.Deff.toExponential(4)+' m²/s';$('memKoa').textContent=f(r.membraneKoa,1)+' mL/min';}
function showDynamic(text,label){
 const r=M.identifyStep(text);dynamicResult={...r,label};$('dynamicLabel').textContent=label;$('gain').textContent=f(r.gain,4);$('tau').textContent=f(r.tau,2)+' s';$('delay').textContent=f(r.delay,2)+' s';
 chart('dynamicChart',r.rows.map((v,i)=>[v.time_s,r.fitted[i]]),r.rows.map(v=>[v.time_s,v.output]),{xLabel:'Tempo · s',yLabel:'Uscita · unità del CSV',split:r.rows[r.split].time_s});
 $('fitStats').textContent=`RMSE stima: ${f(r.rmseTrain,5)} · RMSE parte esclusa: ${f(r.rmseHoldout,5)}. Linea tratteggiata: inizio della verifica.`;
 $('dynamicInfo').textContent=`Δy(t) = ${f(r.gain,4)} Δu [1 − exp(−(t − t₀ − ${f(r.delay,2)}) / ${f(r.tau,2)})] dopo il ritardo. Guadagno nelle unità output/input; τ e θ in secondi. Ricerca numerica a griglia, nessun intervallo di confidenza.`;
}
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(s=>s.hidden=s.id!==b.dataset.tab);document.querySelectorAll('[data-tab]').forEach(e=>{e.classList.toggle('active',e===b);e.removeAttribute('aria-current');});b.setAttribute('aria-current','page');});
$('fluid').addEventListener('change',safe(()=>{custom=null;configure();}));
$('qd').addEventListener('input',safe(()=>{$('qdRange').value=$('qd').value;updateStatic();}));$('qdRange').addEventListener('input',safe(()=>{$('qd').value=$('qdRange').value;updateStatic();}));$('cin').addEventListener('input',safe(updateStatic));
$('export').addEventListener('click',safe(()=>{updateStatic();download('dialyzer-result.json',JSON.stringify({version:'0.1.0',created:new Date().toISOString(),model:'Apparent countercurrent exchanger, PCHIP KoA; steady CVVHD; zero net UF',dataset:dataset(),result:last,crossValidation:M.crossValidate(dataset()),dynamic:dynamicResult,limitations:['Fixed geometry, Qb, fluid and zero net UF per dataset','No local Jv prediction','No geometry sensitivity identified','No independent experimental validation']},null,2),'application/json');}));
$('template').addEventListener('click',()=>download('steady-template.csv','qd_mlmin,clearance_water_mlmin,qb_mlmin,uf_net_mlmin\n','text/csv'));
$('restore').addEventListener('click',safe(()=>{custom=null;$('steadyFile').value='';configure();}));
$('steadyFile').addEventListener('change',async()=>{try{if(!$('steadyFile').files.length)return;const file=$('steadyFile').files[0],fluid=$('importFluid').value;const candidate=M.importSteady(await file.text(),{name:$('importName').value.trim()||file.name,qb:Number($('importQb').value),fw:fluid==='water'?1:Number($('importFw').value),fluid,source:'User-imported CSV: '+file.name});custom=candidate;$('fluid').value=fluid;$('status').hidden=true;configure();}catch(e){$('status').textContent=e.message;$('status').hidden=false;}});
$('dynamicFile').addEventListener('change',async()=>{try{if(!$('dynamicFile').files.length)return;const file=$('dynamicFile').files[0];showDynamic(await file.text(),'SERIE IMPORTATA · '+file.name);$('status').hidden=true;}catch(e){$('status').textContent=e.message;$('status').hidden=false;}});
$('demo').addEventListener('click',safe(()=>{const t=Array.from({length:101},(_,i)=>i*2),params={y0:.2,gain:.6,du:1,tStep:20,tau:30,delay:6},y=M.stepResponse(t,params);showDynamic('time_s,input,output\n'+t.map((v,i)=>`${v},${v<20?1:2},${y[i]}`).join('\n'),'DEMO SINTETICA · NON SPERIMENTALE');}));
for(const id of ['thickness','lp','mu','area','eps','tortuosity','dbulk'])$(id).addEventListener('input',safe(membraneUpdate));
safe(configure)();safe(membraneUpdate)();

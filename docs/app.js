'use strict';
const D=window.DialyzerDesign,M=window.DialyzerModel,$=id=>document.getElementById(id);
let custom=null,last=null;
const f=(x,n=2)=>Number(x).toLocaleString('en-GB',{minimumFractionDigits:n,maximumFractionDigits:n});
function safe(fn){return (...args)=>{try{$('status').hidden=true;return fn(...args);}catch(e){for(const id of ['k','koa','removal','cb','cd','kbulk'])$(id).textContent='—';last=null;$('status').textContent=e.message;$('status').hidden=false;}};}
function download(name,content,type='text/plain'){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([content],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500);}
function dataset(){return custom||M.presets[$('fluid').value];}
function chart(target,series,points,{xLabel='Qd · mL/min',yLabel='Clearance · mL/min',split=null}={}){
 const all=[...series,...points];if(!all.length)return;
 const w=700,h=300,l=65,r=22,t=25,b=52;
 let xmin=Math.min(...all.map(p=>p[0])),xmax=Math.max(...all.map(p=>p[0])),ymin=Math.min(0,...all.map(p=>p[1])),ymax=Math.max(...all.map(p=>p[1]));
 if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;const pad=(ymax-ymin)*.1;ymax+=pad;if(ymin<0)ymin-=pad;
 const sx=x=>l+(x-xmin)/(xmax-xmin)*(w-l-r),sy=y=>h-b-(y-ymin)/(ymax-ymin)*(h-t-b);
 const el=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;};
 const svg=el('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':`${yLabel} versus ${xLabel}`});
 for(let i=0;i<=4;i++){const y=ymin+(ymax-ymin)*i/4;svg.append(el('line',{x1:l,y1:sy(y),x2:w-r,y2:sy(y),stroke:'#4d7b98'}));svg.append(el('text',{x:l-12,y:sy(y)+4,'text-anchor':'end'},f(y,1)));const x=xmin+(xmax-xmin)*i/4;svg.append(el('text',{x:sx(x),y:h-b+24,'text-anchor':'middle'},f(x,1)));}
 if(split!==null)svg.append(el('line',{x1:sx(split),x2:sx(split),y1:t,y2:h-b,stroke:'#8fc7ef','stroke-dasharray':'5 4'}));
 svg.append(el('path',{d:series.map((p,i)=>`${i?'L':'M'}${sx(p[0])},${sy(p[1])}`).join(' '),fill:'none',stroke:'#fff','stroke-width':2.7}));
 points.forEach(p=>svg.append(el('circle',{cx:sx(p[0]),cy:sy(p[1]),r:4,fill:'#fff',stroke:'#003153','stroke-width':1.5})));
 svg.append(el('text',{x:l,y:13},yLabel));svg.append(el('text',{x:(l+w-r)/2,y:h-6,'text-anchor':'middle'},xLabel));
 $(target).classList.remove('placeholder');$(target).replaceChildren(svg);
}
function tableRows(id,rows){$(id).replaceChildren(...rows.map(values=>{const tr=document.createElement('tr');values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});return tr;}));}
function updateData(){
 const d=dataset();$('datasetName').textContent=d.name;
 tableRows('dataRows',d.rows.map(r=>{const p=M.predict(d,r[0]);return[f(r[0]),f(r[1]),f(p.kWater),f(p.koa,1)];}));
 const cv=M.crossValidate(d);$('cv').textContent=cv.rmse===null?'At least three points are needed to omit an interior node.':`Held-out RMSE: ${f(cv.rmse,3)} mL/min. An internal check of the reduction, not independent experimental validation.`;
 tableRows('cvRows',cv.points.map(p=>[f(p.qd),f(p.observed),f(p.predicted),f(p.error,3)]));
 $('lowCheck').hidden=!d.correlationModel;
 if(d.correlationModel){
  $('lowCheck').textContent=d.fluid==='water'?`Numerical cross-check, not fitted: at Qd = 5 mL/min the reduced model predicts ${f(M.predict(d,5).kWater,3)} mL/min; the numerical benchmark is approximately 4.66 mL/min. The difference is ${f(100*(M.predict(d,5).kWater/4.66-1),2)}%. This compares models, not raw experiments.`:'The blood dataset starts at 41.67 mL/min. That portion of the curve is a reduced-model prediction, not a validated blood result.';
 }
 const roles={0:'Imposed boundary',5:'Correlation prediction',17.5:'Identified coefficient',41.67:'Identified coefficient',66.67:'Identified coefficient',100:'Correlation prediction',133.33:'Identified coefficient'};
 tableRows('correlationRows',[0,5,17.5,41.67,66.67,100,133.33].map(q=>[f(q),M.effectiveDapp(q).toExponential(6),roles[q]]));
}
function updateStatic(){
 const d=dataset(),qd=Number($('qd').value),cin=Number($('cin').value);if(!custom&&qd>133.33)$('designEnabled').checked=true;syncFlowControls();last=designActive()?D.predict(readDesign(),$('fluid').value,qd,cin):M.predict(d,qd,cin); updateDesignOutputs();
 const set=(id,val)=>$(id).textContent=val;
 set('k',f(last.kWater));set('koa',f(last.koa,1));set('removal',f(last.removal_mgmin,2));set('cb',f(last.cBulkOut,4)+' kg/m³');set('cd',last.cDialysateOut===null?'N/A · no effluent':f(last.cDialysateOut,4)+' kg/m³');set('kbulk',f(last.kBulk)+' mL/min');set('qb',f(last.qb||d.qb,2)+' mL/min');set('qw',f(last.qw,2)+' mL/min');
 document.querySelector('.filterIdentity span').textContent=designActive()?'DESIGN BASED ON REFERENCE':'FILTER DATASET';set('sourceTag',custom?'IMPORTED DATA':designActive()?'MEMBRANE DESIGN':'HF1000 REFERENCE');set('designRatio',f(last.conductanceRatio||1,4));
 set('dappValue',last.dapp===null?'N/A · imported model':last.dapp.toExponential(6)+' m²/s');set('factorValue',last.equivalentFactor===null?(designActive()?'Replaced by 1D conductance ratio':'N/A · direct K₀A interpolation'):f(last.equivalentFactor,6));
 set('predictionNotice',last.extrapolated?'Exploratory extrapolation: Qd exceeds 133.33 mL/min. The unresolved HF1000 resistance decays asymptotically, matching the terminal value and slope; the equivalent reference factor is held constant. The 1D solver uses actual flows and membrane properties. Urea · pristine membrane · CVVHD · zero net UF.':designActive()?'Design prediction: reference-normalised 1D transport. Modified membranes and operating conditions have not been independently validated. Net UF is constrained to zero.':qd===0?'Zero-flow limit: no net steady solute removal. Dialysate effluent concentration is not defined.':custom?'Imported-data model: interpolation within the measured flow range.':d.fluid==='blood'&&qd<41.67?'Low-flow blood prediction: the transport correlation is retained and the equivalent factor is continued below the available blood dataset. This region has not been validated against blood data.':d.fluid==='water'&&qd<17.5?'Low-flow water prediction: the effective diffusivity follows the transport correlation; the equivalent factor is held at its first calibration value.':'Reduced-model prediction: Dapp plus an identified equivalent factor. Enable the membrane design explorer to change geometry, material properties or feed flow.');
 set('sourceNote',custom?`${d.name}. User-imported data; the filter and conditions must match the experiment. No independent validation is implied.`:d.source);
 const [x0,xmax]=M.domain(d),x1=custom?xmax:Math.max(xmax,qd),count=designActive()?40:200,props=designActive()?readDesign():null,curve=Array.from({length:count+1},(_,i)=>{const q=i===count?x1:x0+(x1-x0)*i/count;return[q,props?D.predict(props,$('fluid').value,q,cin).kWater:M.predict(d,q).kWater];});chart('staticChart',curve,d.rows,{split:!custom&&x1>133.33?133.33:null});updateData();
}
function syncFlowControls(){const [lo,hi]=M.domain(dataset()),q=Number($('qd').value),upper=custom?hi:Math.max(1000,Number.isFinite(q)?q:0);$('qd').min=lo;if(custom)$('qd').max=hi;else $('qd').removeAttribute('max');$('qdRange').min=lo;$('qdRange').max=upper;$('qdRange').value=q;$('minQ').textContent=f(lo);$('maxQ').textContent=f(upper);}
function configure(){const d=dataset(),[lo,hi]=M.domain(d);let q=Number($('qd').value);if(!Number.isFinite(q))q=lo;q=custom?Math.max(lo,Math.min(hi,q)):Math.max(0,q);$('qd').value=q;syncFlowControls();document.querySelectorAll('[data-flow]').forEach(b=>b.disabled=custom&&(Number(b.dataset.flow)<lo||Number(b.dataset.flow)>hi));updateStatic();}
function designActive(){return $('designEnabled').checked&&!custom;}
function readDesign(){const p={...D.defaults};document.querySelectorAll('[data-property]').forEach(e=>p[e.dataset.property]=e.tagName==='SELECT'?e.value:Number(e.value));return D.validate(p);}
function resetDesign(){document.querySelectorAll('[data-property]').forEach(e=>e.value=D.defaults[e.dataset.property]);$('designEnabled').checked=false;}
function updateDesignOutputs(){const p=readDesign(),g=D.geometry(p),h=designActive()?last.hydraulics:null;$('darcy').textContent=g.k.toExponential(4)+' m²';$('deff').textContent=(p.membraneDiffusivity*p.porosity/p.tortuosity*p.hindrance).toExponential(4)+' m²/s';$('fiberCount').textContent=f(g.nf,0);$('grossUF').textContent=h?f(h.forward_mLmin,3)+' / '+f(h.back_mLmin,3)+' mL/min':'N/A · enable design at positive Qd';$('netUF').textContent=h?f(h.net_mLmin,6)+' mL/min':'0 mL/min · imposed';$('pressureDrops').textContent=h?f(h.bloodPressureDrop_mmHg,2)+' / '+f(h.dialysatePressureDrop_mmHg,2)+' mmHg':'N/A';$('design_Lp').disabled=p.hydraulicMode!=='Lp';$('design_darcy_m2').disabled=p.hydraulicMode!=='darcy';}
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(s=>s.hidden=s.id!==b.dataset.tab);document.querySelectorAll('[data-tab]').forEach(e=>{e.classList.toggle('active',e===b);e.removeAttribute('aria-current');});b.setAttribute('aria-current','page');});
for(const button of document.querySelectorAll('[data-flow]'))button.addEventListener('click',safe(()=>{$('qd').value=button.dataset.flow;$('qdRange').value=button.dataset.flow;updateStatic();}));
$('fluid').addEventListener('change',safe(()=>{custom=null;configure();}));
$('qd').addEventListener('input',safe(()=>{$('qdRange').value=$('qd').value;updateStatic();}));$('qdRange').addEventListener('input',safe(()=>{$('qd').value=$('qdRange').value;updateStatic();}));$('cin').addEventListener('input',safe(updateStatic));
$('export').addEventListener('click',safe(()=>{updateStatic();download('dialyzer-result.json',JSON.stringify({version:'0.5.0',created:new Date().toISOString(),referenceFilter:'Baxter Prismaflex HF1000',model:designActive()?'Reference-normalised 1D design exploration':'HF1000 reference reduction',design:designActive()?readDesign():null,result:last,dataset:dataset(),limitations:['Modified membrane and operating-condition predictions require independent validation','For Qd > 133.33 mL/min, unresolved HF1000 resistance decays exponentially to zero with matched endpoint value and slope; the reference equivalent factor is held constant. This is an explicit extrapolation assumption','Zero net UF; freely sieved urea; no adsorption, fouling or oncotic pressure','Blood predictions below 41.67 mL/min lack blood validation data','Reference matching is calibration, not independent validation']},null,2),'application/json');}));
$('template').addEventListener('click',()=>download('steady-template.csv','qd_mlmin,clearance_water_mlmin,qb_mlmin,uf_net_mlmin\n','text/csv'));
$('restore').addEventListener('click',safe(()=>{custom=null;$('steadyFile').value='';configure();}));
$('steadyFile').addEventListener('change',async()=>{try{if(!$('steadyFile').files.length)return;const file=$('steadyFile').files[0],fluid=$('importFluid').value;const candidate=M.importSteady(await file.text(),{name:$('importName').value.trim()||file.name,qb:Number($('importQb').value),fw:fluid==='water'?1:Number($('importFw').value),fluid,source:'User-imported CSV: '+file.name});custom=candidate;$('fluid').value=fluid;$('status').hidden=true;configure();}catch(e){$('status').textContent=e.message;$('status').hidden=false;}});
document.querySelectorAll('[data-property]').forEach(e=>e.addEventListener('input',safe(()=>{if(custom)throw Error('Restore a built-in preset before exploring membrane designs.');$('designEnabled').checked=true;updateStatic();})));
$('designEnabled').addEventListener('change',safe(()=>{if(custom){$('designEnabled').checked=false;throw Error('Restore a built-in preset before enabling design exploration.');}updateStatic();}));
$('resetDesign').addEventListener('click',safe(()=>{resetDesign();updateStatic();}));
resetDesign();safe(configure)();

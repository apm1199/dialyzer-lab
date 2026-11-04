/* Preset agreement flags: test conditions, numerical availability and error are distinct. */
(function(root){'use strict';
function classify(points){
 const valid=points.filter(p=>Number.isFinite(p.predicted)&&Number.isFinite(p.observed)&&p.observed>0),outside=valid.filter(p=>Math.abs(100*(p.predicted/p.observed-1))>10).length,missing=points.length-valid.length;
 const state=!points.length?'unassessed':!valid.length?'unavailable':outside===points.length?'outside':outside?'partial':missing?'incomplete':'within';
 const labels={unassessed:'no comparable data',unavailable:'not calculable',outside:'all points outside ±10%',partial:'some points outside ±10%',incomplete:'incomplete calculation',within:'within ±10% at tested points'};
 return {state,label:labels[state],marker:state==='outside'?'🔴 ':state==='partial'?'🟠 ':['unavailable','incomplete'].includes(state)?'⚪ ':'',color:state==='outside'?'#ff8585':state==='partial'?'#ffb454':state==='within'?'#ffffff':'#c0ced8',total:points.length,calculated:valid.length,outside,within:valid.length-outside,missing};
}
function build(C,D){return Object.fromEntries(C.filters.filter(C.applicable).map(f=>{const points=C.comparable(f).map(b=>{try{return {observed:b.k,predicted:D.predict(C.properties(D,f.id,b.qb),'water',b.qd).kWater};}catch{return {observed:b.k,predicted:null};}});return [f.id,classify(points)];}));}
const api={classify,build};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DialyzerFilterStatus=api;
})(typeof window!=='undefined'?window:globalThis);

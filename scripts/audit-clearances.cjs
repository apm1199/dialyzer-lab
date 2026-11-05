/* Observations never change model inputs. Invalid points remain in the audit. */
const fs=require('node:fs'),C=require('../docs/catalog-water.js'),D=require('../docs/design.js');
const rows=[],groups={};
for(const filter of C.filters.filter(C.applicable))for(const b of filter.benchmarks.filter(b=>b.qf===0)){
 const p=C.properties(D,filter.id,b.qb),eligible=C.comparable(filter).includes(b),g=D.geometry(p);let predicted=null,refined=null,error='';
 try{if(!C.hydraulicProfile(D,filter.id,p).available)throw Error('Measured water Lp or equivalent Darcy permeability is missing.');predicted=D.predict(p,'water',b.qd).kWater;if(eligible)refined=D.predict({...p,cells:400},'water',b.qd).kWater;}catch(e){error=e.message;}
 const errorPct=predicted===null?null:100*(predicted/b.k-1);
 const r={id:filter.id,manufacturer:filter.manufacturer,filter:filter.name,eligible,medium:filter.protocol.clearanceTestFluid,mediumProvenance:filter.protocol.verifiedClearanceSource?.kind||'datasheet',area_m2:g.area,fibreCount:g.nf,moduleDiameter_mm:p.shellDiameter_mm,equivalentDialysateRadius_um:g.rd*1e6,packing:g.packing,smallAreaFlag:g.area<=.6,qb:b.qb,qd:b.qd,qf:b.qf,observed:b.k,predicted,errorPct,within10Pct:predicted===null?null:Math.abs(errorPct)<=10,status:predicted===null?'not-calculable':'calculated',error,cells:p.cells,predicted400Cells:refined,meshChangePct:refined===null?null:100*(refined/predicted-1),assumedProperties:C.assumptions(filter).join(';'),source:filter.source.file};rows.push(r);
 if(eligible){const a=groups[filter.manufacturer]??={points:0,calculated:0,within:0,max:0,filters:new Set()};a.points++;a.filters.add(filter.id);if(predicted!==null){a.calculated++;a.within+=r.within10Pct;a.max=Math.max(a.max,Math.abs(errorPct));}}
}
const valid=rows.filter(r=>r.eligible&&r.predicted!==null);
const invalid=rows.filter(r=>r.eligible&&r.predicted===null);
const summary={
 eligible:valid.length+invalid.length,
 calculated:valid.length,
 within10:valid.filter(r=>r.within10Pct).length,
 notCalculable:invalid.length,
 groups:Object.fromEntries(Object.entries(groups).map(([k,g])=>[k,{...g,filters:g.filters.size}]))
};
const report=JSON.stringify({summary,rows},null,2)+'\n';
if(process.argv[2]==='--output'&&process.argv[3])fs.writeFileSync(process.argv[3],report);
else process.stdout.write(report);

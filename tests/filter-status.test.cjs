const {test}=require('node:test'),assert=require('node:assert/strict'),S=require('../docs/filter-status.js'),C=require('../docs/catalog-geometry.js'),D=require('../docs/design.js');
test('colour flags distinguish partial agreement, total disagreement and noncalculable points',()=>{
 assert.equal(S.classify([{observed:100,predicted:109},{observed:100,predicted:111}]).state,'partial');assert.equal(S.classify([{observed:100,predicted:111},{observed:100,predicted:80}]).state,'outside');assert.equal(S.classify([{observed:100,predicted:null}]).state,'unavailable');assert.equal(S.classify([]).state,'unassessed');assert.equal(S.classify([{observed:100,predicted:100},{observed:100,predicted:null}]).state,'incomplete');assert.equal(S.classify([{observed:100,predicted:100}]).state,'within');
});
test('catalog flags preserve failed calculations as unavailable and manufacturer observations as independent targets',()=>{
 const a=S.build(C,D);assert.equal(a['nipro-sureflux-03l'].state,'outside');assert.equal(a['baxter-prismaflex-st60'].state,'partial');assert.equal(a['fresenius-fx-classix-100'].state,'unavailable');assert.equal(a['baxter-prismaflex-hf1000'].state,'within');assert.equal(a['baxter-prismaflex-hf1400'].state,'within');assert.equal(a['baxter-evodial-1-0'].state,'partial');const counts={};for(const x of Object.values(a))counts[x.state]=(counts[x.state]||0)+1;assert.equal(counts.outside,7);assert.equal(counts.partial,50);assert.equal(counts.unavailable,3);assert.equal(counts.within,79);
});
test('Baxter HF presets include consistent reported counts, traceable geometry and saline zero-UF observations',()=>{
 for(const [id,count,area,qb]of [['baxter-prismaflex-hf1000',7500,1.1,100],['baxter-prismaflex-hf1400',9500,1.4,200]]){const f=C.find(id),p=C.properties(D,id,qb),g=D.geometry(p);assert.equal(p.fiberCount,count);assert.equal(p.area_m2,area);assert.equal(p.length_mm,218);assert.equal(g.nf,count);assert.equal(C.comparable(f).length,4);assert.ok(C.comparable(f).every(b=>b.qb===qb&&b.qf===0));assert.equal(f.protocol.verifiedClearanceSource.medium,'saline at 37 C');assert.ok(Math.abs(g.area/area-1)<.01);}
});


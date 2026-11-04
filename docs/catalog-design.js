/* Design geometry policy, separate from the retained manufacturer catalog. */
(function(root){'use strict';
const C=typeof module!=='undefined'&&module.exports?require('./catalog.js'):root.DialyzerCatalog;
function properties(D,id,qb){const p=C.properties(D,id,qb),filter=C.find(id);if(!('shellDiameter_mm' in filter.properties))p.shellDiameter_mm=D.designDefaults.shellDiameter_mm;return p;}
function assumptions(filter){const a=C.assumptions(filter).filter(k=>k!=='packing'||filter.properties.shellDiameter_mm===0);if(!('shellDiameter_mm' in filter.properties))a.push('shellDiameter_mm');return a;}
const f=C.find('nipro-sureflux-03l');if(f&&!f.notes.some(n=>n.startsWith('Low-flux cellulose-triacetate'))){f.notes.push('Low-flux cellulose-triacetate dialyzer. Manufacturer sources reviewed establish HD applications and zero-UF in-vitro urea tests; a specific CVVHD indication has not been established. Availability supports numerical exploration, not a clinical-use recommendation. The 40 mm module internal diameter is assumed, not manufacturer-reported.');f.protocol.indicationSource={url:'https://www.nipro-group.com/en/our-offer/products-services/surefluxtm',scope:'Family-level HD/HF/HDF and pediatric applications; no specific CVVHD claim established'};}
const api={...C,properties,assumptions};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DialyzerCatalog=api;
})(typeof window!=='undefined'?window:globalThis);

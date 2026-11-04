/* Reference-normalised 1D design exploration. SI internally; no CFD runtime. */
(function(root){
'use strict';
const M=typeof module!=='undefined'&&module.exports?require('./model.js'):root.DialyzerModel;
const F=1e-6/60,MMHG=133.322387415;
const defaults={fiberCount:0,shellDiameter_mm:0,feedFlow_mLmin:100,hydraulicMode:'Lp',darcy_m2:3.343574515699709e-18,area_m2:M.geometry.area,length_mm:218,diameter_um:2*M.geometry.ri*1e6,thickness_um:(M.geometry.ro-M.geometry.ri)*1e6,packing:.5,porosity:.5205,tortuosity:Math.SQRT2,membraneDiffusivity:1.9e-9,hindrance:1,Lp:32,muPore:.00100299,muWater:.00100299,muBlood:.0035,rheology:'carreau',mu0:.0225,muInf:.0022,carreauTime:.11,carreauN:.392,carreauA:.644,hematocrit:.35,plasmaWater:.93,rbcWater:.72,waterDiffusivity:1.9e-9,bloodDiffusivity:7.4e-10,dialysateDiffusivity:1.9e-9,ShBlood:4.36,ShDialysate:3.66,cells:100};
// Preserve the original calibration geometry; design exploration assumes a 40 mm module.
const designDefaults={...defaults,shellDiameter_mm:40};
function need(v,m){if(!v)throw Error(m);}
function validate(input){
 const p={...defaults,...input};
 for(const k of Object.keys(input))need(k in defaults,'Unknown design property: '+k);
 for(const [k,v]of Object.entries(p))if(!['rheology','hydraulicMode'].includes(k))need(Number.isFinite(v),'A finite value is required: '+k);
 for(const k of ['feedFlow_mLmin','area_m2','length_mm','diameter_um','thickness_um','tortuosity','membraneDiffusivity','hindrance','muPore','muWater','muBlood','mu0','muInf','carreauTime','carreauA','waterDiffusivity','bloodDiffusivity','dialysateDiffusivity','ShBlood','ShDialysate'])need(p[k]>0,'A positive value is required: '+k);
 for(const k of ['porosity','packing','plasmaWater','rbcWater','hindrance'])need(p[k]>0&&p[k]<=1,'Fraction outside (0,1]: '+k);
 need(p.packing<1,'Packing must be less than one.');need(p.Lp>=0&&p.darcy_m2>=0,'Hydraulic permeability must not be negative.');need(['Lp','darcy'].includes(p.hydraulicMode),'Unknown hydraulic input mode.');need(p.hematocrit>=0&&p.hematocrit<1,'Haematocrit must be a fraction in [0,1).');need(p.carreauN>0&&p.carreauN<=1,'Carreau n must lie in (0,1].');need(p.mu0>=p.muInf,'Zero-shear viscosity must be at least the high-shear value.');
 need(p.fiberCount>=0&&Number.isInteger(p.fiberCount),'Fibre count must be an integer, or 0 to derive it from area.');
 need(p.shellDiameter_mm>=0,'Module internal diameter must not be negative.');
 if(p.shellDiameter_mm>0)need(geometry(p).rd>geometry(p).ro,'Module internal diameter is too small for this fibre bundle.');
 need(p.cells>=20&&p.cells<=400&&Number.isInteger(p.cells),'Use 20 to 400 axial cells.');need(['newtonian','carreau'].includes(p.rheology),'Unknown rheology.');
 return p;
}
function bernoulli(z){if(Math.abs(z)<1e-5)return 1-z/2+z*z/12-z**4/720;if(z>50)return z*Math.exp(-z)/(1-Math.exp(-z));if(z< -50)return -z/(1-Math.exp(z));return z/Math.expm1(z);}
function tri(lower,diag,upper,rhs){const n=diag.length,c=Array(n),d=Array(n),out=Array(n);for(let i=0;i<n;i++){const a=diag[i]-(i?lower[i]*c[i-1]:0);need(a>0&&Number.isFinite(a),'Hydraulic linear solve failed.');c[i]=upper[i]/a;d[i]=(rhs[i]-(i?lower[i]*d[i-1]:0))/a;}for(let i=n-1;i>=0;i--)out[i]=d[i]-(i<n-1?c[i]*out[i+1]:0);return out;}
function muAt(p,fluid,q,nf,ri){if(fluid==='water')return p.muWater;if(p.rheology==='newtonian')return p.muBlood;const rate=4*Math.abs(q)/(nf*Math.PI*ri**3);return p.muInf+(p.mu0-p.muInf)*(1+(p.carreauTime*rate)**p.carreauA)**((p.carreauN-1)/p.carreauA);}
function geometry(p){
 const ri=p.diameter_um*1e-6/2,ro=ri+p.thickness_um*1e-6,L=p.length_mm/1000;
 const nf=p.fiberCount>0?p.fiberCount:p.area_m2/(2*Math.PI*ri*L),area=2*Math.PI*ri*L*nf;
 const shellRadius=p.shellDiameter_mm>0?p.shellDiameter_mm/2000:ro*Math.sqrt(nf/p.packing),rd=shellRadius/Math.sqrt(nf),packing=ro*ro/(rd*rd),lc=ri*Math.log(ro/ri);
 const lp=p.Lp*1e-6/3600/MMHG,k=p.hydraulicMode==='darcy'?p.darcy_m2:lp*p.muPore*(ro-ri),lpCyl=k/(p.muPore*lc);
 return {ri,ro,L,nf,area,rd,shellRadius,packing,lc,lp,k,lpCyl,dx:L/p.cells,da:area/p.cells,ab:nf*Math.PI*ri**2,ad:nf*Math.PI*(rd*rd-ro*ro)};
}
function hydraulics(p,fluid,qd,qb=p.feedFlow_mLmin){
 const g=geometry(p),N=p.cells,B0=qb*F,D0=qd*F,fw=fluid==='water'?1:(1-p.hematocrit)*p.plasmaWater+p.hematocrit*p.rbcWater,nw=B0*(1-fw);
 const annulus=g.rd**4-g.ro**4-(g.rd*g.rd-g.ro*g.ro)**2/Math.log(g.rd/g.ro);need(annulus>0,'Degenerate dialysate annulus.');
 const rd=8*p.muWater/(g.nf*Math.PI*annulus),coupling=g.dx*g.dx*(g.area/g.L)*g.lpCyl;
 let b=Array(N+1).fill(B0),converged=false;
 for(let iteration=0;iteration<120;iteration++){
  const lo=Array(N-1).fill(-1),up=Array(N-1).fill(-1),di=[],rhs=[];
  for(let j=1;j<N;j++){const rb=8*muAt(p,fluid,b[j],g.nf,g.ri)/(g.nf*Math.PI*g.ri**4);di.push(2+coupling*(rb+rd));rhs.push(-coupling*rd*(D0-B0)+(j===1?B0:0)+(j===N-1?B0:0));}
  const middle=tri(lo,di,up,rhs),next=[B0,...middle,B0];let delta=0;
  for(let j=1;j<N;j++){const v=.7*next[j]+.3*b[j];delta=Math.max(delta,Math.abs(v-b[j])/B0);b[j]=v;}
  if(delta<1e-11){converged=true;break;}
 }
 need(converged,'The hydraulic model did not converge for this design.');
 const d=b.map(v=>D0+v-B0),bw=b.map(v=>v-nw);need(Math.min(...bw)>0,'This design exhausts the blood-water carrier inside the filter. Reduce hydraulic permeability or change the operating conditions.');
 const q=[],jv=[],fwMid=[],mu=[],pb=Array(N+1).fill(0),pd=Array(N+1).fill(0);let forward=0,back=0;
 for(let i=0;i<N;i++){const v=b[i]-b[i+1];q.push(v);jv.push(v/g.da);fwMid.push(1-nw/((b[i]+b[i+1])/2));mu.push(muAt(p,fluid,(b[i]+b[i+1])/2,g.nf,g.ri));if(v>=0)forward+=v;else back-=v;}
 for(let i=N-1;i>=0;i--)pb[i]=pb[i+1]+8*mu[i]/(g.nf*Math.PI*g.ri**4)*(b[i]+b[i+1])/2*g.dx;
 for(let i=0;i<N;i++)pd[i+1]=pd[i]+rd*(d[i]+d[i+1])/2*g.dx;
 const tmp=g.lpCyl?jv.map(v=>v/g.lpCyl):Array(N).fill(0),offset=tmp.reduce((s,v,i)=>s+(pb[i]+pb[i+1])/2-(pd[i]+pd[i+1])/2-v,0)/N;
 pd.forEach((v,i)=>pd[i]=v+offset);
 return {g,b,d,bw,q,jv,fwMid,mu,pb,pd,tmp,fw,nw,forward,back,net:q.reduce((a,v)=>a+v,0),axialReversal:d.some(v=>v<0)};
}
// Continue the unresolved reference resistance with a positive exponential tail.
// Its value and slope match the last calibrated point; no other-filter clearance is used.
function transportContinuation(qd){
 const q0=133.33,dm=defaults.membraneDiffusivity*defaults.porosity/defaults.tortuosity*defaults.hindrance,d0=M.effectiveDapp(q0),r0=M.geometry.lc*(1/d0-1/dm);
 if(qd<=q0){const d=M.effectiveDapp(qd);return {dapp:d,rAdd:qd===0?Infinity:M.geometry.lc*(1/d-1/dm),extrapolated:false};}
 const slope=(d0-M.effectiveDapp(66.67))/(q0-66.67),rSlope=-M.geometry.lc*slope/(d0*d0),scale=-r0/rSlope,rAdd=r0*Math.exp(-(qd-q0)/scale),dapp=1/(1/dm+rAdd/M.geometry.lc);
 return {dapp,rAdd,scale_mLmin:scale,extrapolated:true};
}
function solveScalar(p,fluid,qd,flow){
 const h=flow,g=h.g,N=p.cells,Cin=1; // Aqueous inlet concentration is normalised to one.
 const materialRef=defaults.membraneDiffusivity*defaults.porosity/defaults.tortuosity*defaults.hindrance;
 const continued=transportContinuation(qd),dapp=continued.dapp,rAdd=continued.rAdd,material=p.membraneDiffusivity*p.porosity/p.tortuosity*p.hindrance;
 const rm=g.lc/material+rAdd;need(rm>0&&Number.isFinite(rm),'Invalid membrane transport resistance.');
 const lower=[],upper=[],block=[],rhs=[],x=[],y=[],dbCells=h.fwMid.map(fw=>fluid==='water'?p.waterDiffusivity:fw*p.bloodDiffusivity);
 for(let i=0;i<N;i++){
  const db=dbCells[i];
  const kb=p.ShBlood*db/(2*g.ri),kd=p.ShDialysate*p.dialysateDiffusivity/(2*(g.rd-g.ro)),P=1/(1/kb+rm+1/kd),Pe=h.jv[i]/P,alpha=P*bernoulli(-Pe),beta=P*bernoulli(Pe);
  const fbL=h.bw[i],fbR=h.bw[i+1],fdL=-h.d[i],fdR=-h.d[i+1];
  // Upwind axial advection supports internal dialysate flow reversal.
  const gbL=(i?(db+dbCells[i-1])/2:db)*g.ab/g.dx,gbR=(i<N-1?(db+dbCells[i+1])/2:db)*g.ab/g.dx,gd=p.dialysateDiffusivity*g.ad/g.dx;
  const lb=-Math.max(fbL,0)-(i?gbL:0),ub=-Math.max(-fbR,0)-(i<N-1?gbR:0),ld=-Math.max(fdL,0)-(i?gd:0),ud=-Math.max(-fdR,0)-(i<N-1?gd:0);
  const a=Math.max(fbR,0)+Math.max(-fbL,0)+g.da*alpha+(i?gbL:0)+(i<N-1?gbR:0),b=-g.da*beta,c=-g.da*alpha,d=Math.max(fdR,0)+Math.max(-fdL,0)+g.da*beta+(i?gd:0)+(i<N-1?gd:0);
  lower.push([i?lb:0,i?ld:0]);upper.push([i<N-1?ub:0,i<N-1?ud:0]);block.push([a,b,c,d]);rhs.push([i===0?Math.max(fbL,0)*Cin:0,0]);
 }
 // Block Thomas elimination for a conservative, two-compartment balance.
 for(let i=0;i<N;i++){
  let [a,b,c,d]=block[i],[r,s]=rhs[i];
  if(i){const [l1,l2]=lower[i],v=x[i-1],w=y[i-1];a-=l1*v[0];b-=l1*v[1];c-=l2*v[2];d-=l2*v[3];r-=l1*w[0];s-=l2*w[1];}
  const det=a*d-b*c;need(det>0&&Number.isFinite(det),'The solute balance is singular for this design.');
  const [u1,u2]=upper[i];x.push([d*u1/det,-b*u2/det,-c*u1/det,a*u2/det]);y.push([(d*r-b*s)/det,(-c*r+a*s)/det]);
 }
 const cb=Array(N),cd=Array(N);
 for(let i=N-1;i>=0;i--){let [r,s]=y[i];if(i<N-1){const v=x[i];r-=v[0]*cb[i+1]+v[1]*cd[i+1];s-=v[2]*cb[i+1]+v[3]*cd[i+1];}cb[i]=r;cd[i]=s;}
 need(Math.min(...cb,...cd)>-1e-7,'The concentration solution is nonphysical.');
 const removal=h.bw[0]*Cin-h.bw[N]*cb[N-1],gain=h.d[0]*cd[0],balance=Math.abs(removal-gain)/Math.max(h.bw[0]*Cin,1e-30),k=removal/F;
 need(balance<1e-7,'The design solute mass balance did not close.');need(k>=-1e-8,'Negative clearance in the design solve.');
 return {k:Math.max(0,k),cb,cd,balance,rm,material,rAdd};
}
const cache=new Map();
function raw(p,fluid,qd){const flow=hydraulics(p,fluid,qd),solute=solveScalar(p,fluid,qd,flow);return {flow,solute};}
function apparent(k,qw,qd){const cap=Math.min(qw,qd);return M.koaFromK(Math.max(cap*1e-12,Math.min(k,cap*(1-1e-10))),qw,qd);}
function predict(input,fluid,qd,cBulk=.885){
 const p=validate(input);need(['water','blood'].includes(fluid),'Unknown feed fluid.');need(Number.isFinite(qd)&&qd>=0,'Dialysate flow must be finite and nonnegative.');need(cBulk>0&&Number.isFinite(cBulk),'A positive concentration is required.');
 const coefficientFlow=Math.min(qd,133.33),reference=M.predict(M.presets[fluid],coefficientFlow,cBulk),fw=fluid==='water'?1:(1-p.hematocrit)*p.plasmaWater+p.hematocrit*p.rbcWater,qw=p.feedFlow_mLmin*fw;
 if(qd===0)return {...reference,qb:p.feedFlow_mLmin,qw,cWaterIn:cBulk/fw,cWaterOut:cBulk/fw,design:p,hydraulics:null,filtrationFraction:null,filtrationFractionPct:null,materialDiffusivity:p.membraneDiffusivity*p.porosity/p.tortuosity*p.hindrance,hydraulicDarcy:geometry(p).k,status:'Zero-flow design limit',model:'Reference-normalised 1D design model'};
 const key=fluid+'|'+qd.toPrecision(12)+'|'+p.cells;let base=cache.get(key);if(!base){base=raw({...defaults,cells:p.cells},fluid,qd);if(cache.size>500)cache.clear();cache.set(key,base);}
 const current=raw(p,fluid,qd),baseKoa=apparent(base.solute.k,100*M.presets[fluid].fw,qd),newKoa=apparent(current.solute.k,qw,qd),ratio=newKoa/baseKoa,tailFactor=qd>133.33?transportContinuation(qd).dapp/M.effectiveDapp(133.33):1,koa=reference.koa*tailFactor*ratio,k=M.kFromKoa(koa,qw,qd),cw=cBulk/fw;
 const h=current.flow,g=h.g;
 return {...reference,qd,qb:p.feedFlow_mLmin,qw,koa,kWater:k,kBulk:k/fw,cWaterIn:cw,cWaterOut:cw*(1-k/qw),cBulkOut:cBulk*(1-k/qw),cDialysateOut:k*cw/qd,removal_mgmin:k*cw,equivalentFactor:null,dapp:g.lc/current.solute.rm,design:p,conductanceRatio:ratio,hydraulicDarcy:g.k,materialDiffusivity:current.solute.material,model:'Reference-normalised 1D design model',coefficientFlow_mLmin:coefficientFlow,extrapolated:qd>133.33,continuation:qd>133.33?transportContinuation(qd):null,status:qd>133.33?'Exploratory extrapolation · asymptotic decay of unresolved reference resistance':'Design exploration · unvalidated parameter transfer',filtrationFraction:h.forward/(p.feedFlow_mLmin*F),filtrationFractionPct:100*h.forward/(p.feedFlow_mLmin*F),hydraulics:{forward_mLmin:h.forward/F,back_mLmin:h.back/F,net_mLmin:h.net/F,bloodPressureDrop_mmHg:(h.pb[0]-h.pb.at(-1))/MMHG,dialysatePressureDrop_mmHg:(h.pd.at(-1)-h.pd[0])/MMHG,peakTMP_mmHg:Math.max(...h.tmp.map(Math.abs))/MMHG,axialReversal:h.axialReversal,fibers:g.nf,massBalanceRelative:current.solute.balance,x_m:Array.from({length:p.cells},(_,i)=>(i+.5)*g.dx),Jv_ms:h.jv,rawCb:current.solute.cb,rawCd:current.solute.cd,waterFraction:h.fwMid},rawReferenceClearance:base.solute.k,rawDesignClearance:current.solute.k};
}
const api={defaults,designDefaults,validate,geometry,hydraulics,transportContinuation,raw,predict};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DialyzerDesign=api;
})(typeof window!=='undefined'?window:globalThis);


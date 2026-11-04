/* Browser entry gate, matching the thesis site's access pattern.
   This is not server-side authorization; the GitHub repository and static assets remain public. */
'use strict';
(() => {
 const HASH='84d2e0c530955993a7ee70b7557cf7d75dc9b4ba90b3b4b533a8ece2c912861b',KEY='dialyzerlab.personal-access.v1',LIFETIME=8*60*60*1000;
 let unlocked=false;
 function validSession(){try{const t=Number(sessionStorage.getItem(KEY));return t>0&&Date.now()>=t&&Date.now()-t<LIFETIME;}catch{return false;}}
 function clearSession(){try{sessionStorage.removeItem(KEY);}catch{}}
 function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('The calculator could not load. Check your connection and try again.'));document.head.append(s);});}
 async function openLab(){
  if(unlocked)return;unlocked=true;
  const root=document.getElementById('appRoot');root.replaceChildren(document.getElementById('workspaceTemplate').content.cloneNode(true));
  document.getElementById('signOut').addEventListener('click',()=>{clearSession();location.reload();});
  try{for(const src of ['model.js','design.js','checks.js','catalog.js','catalog-design.js','filter-status.js','transport-metrics.js','app.js'])await loadScript(src+'?v=0.9.5');
   document.getElementById('accessGate').hidden=true;root.hidden=false;window.scrollTo(0,0);
  }catch(e){unlocked=false;root.replaceChildren();throw e;}
 }
 const form=document.getElementById('accessForm'),button=document.getElementById('accessSubmit'),error=document.getElementById('accessError'),password=document.getElementById('accessPassword');
 async function showError(e){error.textContent=e.message;error.hidden=false;}
 form.addEventListener('submit',async e=>{
  e.preventDefault();error.hidden=true;button.disabled=true;button.textContent='Opening…';
  try{
   if(!window.crypto?.subtle)throw Error('A secure HTTPS connection is required.');
   const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password.value)),hash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
   password.value='';
   if(hash!==HASH)throw Error('Incorrect password. Please try again.');
   try{sessionStorage.setItem(KEY,String(Date.now()));}catch{}
   await openLab();
  }catch(e){await showError(e);password.focus();}
  finally{button.disabled=false;button.textContent='Enter Dialyzer Lab →';}
 });
 if(validSession())openLab().catch(showError);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&unlocked&&!validSession()){clearSession();location.reload();}});
})();


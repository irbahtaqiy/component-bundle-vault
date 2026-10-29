import { initVault } from './vault.js';

const db = initVault();

const btnPick = document.getElementById('btn-pick');
const statusEl = document.getElementById('status');
const tabsNav = document.querySelectorAll('.tab');
const views = document.querySelectorAll('.view');
const previewFrame = document.getElementById('preview-frame');
const assetsList = document.getElementById('assets-list');
const codeHtml = document.getElementById('code-html');
const codeCss = document.getElementById('code-css');
const codeAll = document.getElementById('code-all');
const rawJson = document.getElementById('raw-json');
const btnSave = document.getElementById('btn-save');
const vaultList = document.getElementById('vault-list');
const vaultSearch = document.getElementById('vault-search');

let currentBundle = null;

tabsNav.forEach(tab => {
  tab.addEventListener('click', () => {
    tabsNav.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    const v = document.getElementById('view-' + tab.dataset.tab);
    if (v) v.classList.add('active');
    if (tab.dataset.tab === 'vault') renderVault();
  });
});

btnPick.onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      if (statusEl) statusEl.textContent = 'No active tab';
      return;
    }
    const url = tab.url || '';
    if (url.indexOf('chrome://') === 0 || url.indexOf('edge://') === 0 || url.indexOf('chrome-extension://') === 0 || url.indexOf('about:') === 0 || url.indexOf('devtools://') === 0) {
      if (statusEl) statusEl.textContent = 'Cannot run on this page';
      return;
    }
    if (statusEl) statusEl.textContent = 'Starting...';
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      func: () => {
        if (window.__CBV__) return;
        window.__CBV__ = true;
        const st = document.createElement('style');
        st.id = 'cbv-st';
        st.textContent = '.cbv-h{outline:2px dashed #22d3ee!important;outline-offset:2px!important;cursor:crosshair!important}.cbv-o{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:rgba(15,15,20,.95);color:#fff;font:12px/1.4 sans-serif;padding:6px 12px;border-radius:999px;pointer-events:none}';
        document.head.appendChild(st);
        const ov = document.createElement('div');
        ov.className = 'cbv-o';
        ov.textContent = 'CBV • Click element • ESC to cancel';
        document.body.appendChild(ov);
        let h=null;
        function over(e){ const el=e.target; if(!el||el===ov)return; if(h&&h!==el&&h.classList)h.classList.remove('cbv-h'); h=el; if(el.classList)el.classList.add('cbv-h'); }
        function out(e){ const el=e.target; if(el&&el.classList)el.classList.remove('cbv-h'); }
        function key(e){ if(e.key==='Escape'){ clean(); } }
        function click(e){ e.preventDefault();e.stopPropagation();e.stopImmediatePropagation(); const el=e.target; if(!el||el===ov)return; clean(); extract(el); }
        function clean(){ window.__CBV__=false; if(h&&h.classList)h.classList.remove('cbv-h'); document.removeEventListener('mouseover',over,true); document.removeEventListener('mouseout',out,true); document.removeEventListener('click',click,true); document.removeEventListener('keydown',key,true); if(ov.parentNode)ov.parentNode.removeChild(ov); const s2=document.getElementById('cbv-st'); if(s2&&s2.parentNode)s2.parentNode.removeChild(s2); }
        document.addEventListener('mouseover',over,true);
        document.addEventListener('mouseout',out,true);
        document.addEventListener('click',click,true);
        document.addEventListener('keydown',key,true);
        const U=new Set(['display','position','top','right','bottom','left','inset','flex','flex-direction','flex-wrap','align-items','justify-content','gap','row-gap','column-gap','width','height','min-width','max-width','min-height','max-height','margin','margin-top','margin-right','margin-bottom','margin-left','padding','padding-top','padding-right','padding-bottom','padding-left','box-sizing','border','border-width','border-style','border-color','border-radius','background','background-color','background-image','background-size','background-position','background-repeat','color','font-family','font-size','font-weight','line-height','letter-spacing','text-align','text-decoration','text-transform','white-space','vertical-align','opacity','box-shadow','filter','backdrop-filter','cursor','user-select','pointer-events','transition','transform','animation','transform-origin','overflow','overflow-x','overflow-y','z-index','visibility','appearance','outline','outline-offset']);
        function cl(t){ if(!t)return''; const o=[]; t.split(';').forEach(p=>{const s=p.trim();if(!s)return;const i=s.indexOf(':');if(i===-1)return;const pr=s.slice(0,i).trim();const rs=s.slice(i+1).trim();if(!rs)return;if(U.has(pr)||pr.startsWith('--'))o.push(pr+': '+rs);});return o.join(';');}
        function gr(el){ const r=[]; try{ const shs=Array.from(document.styleSheets); for(const sh of shs){ try{ if(sh.href&&sh.href.indexOf('chrome-extension://')===0)continue; const cs=sh.cssRules||sh.rules;if(!cs)continue; for(let i=0;i<cs.length;i++){const rr=cs[i]; if(rr instanceof CSSStyleRule){ try{ if(el.matches(rr.selectorText)) r.push({sel:rr.selectorText,css:rr.style.cssText});}catch(e){} } } }catch(e){} } }catch(e){} return r;}
        function gf(el){ const res={f:new Set(),ff:[],lk:[],ic:{t:'n',f:null,c:[]},sv:[]}; try{ const c=getComputedStyle(el); const ff=c.getPropertyValue('font-family'); if(ff) ff.split(',').forEach(x=>{const cc=x.trim().replace(/['"]/g,''); if(cc&&cc!=='inherit'&&cc!=='initial')res.f.add(cc);}); el.querySelectorAll('*').forEach(ch=>{try{const cc=getComputedStyle(ch);const cff=cc.getPropertyValue('font-family'); if(cff)cff.split(',').forEach(x=>{const c2=x.trim().replace(/['"]/g,''); if(c2&&c2!=='inherit')res.f.add(c2);}); if(ch.tagName==='svg')res.sv.push(ch.outerHTML);}catch(e){} }); const ICONS=['Material Symbols','Font Awesome','Phosphor','Remix Icon','Bootstrap Icons']; for(const x of res.f){for(const ic of ICONS){if(x.toLowerName ? false : x.toLowerCase().includes(ic.toLowerCase())){res.ic.t='font';res.ic.f=x;break;}}if(res.ic.t==='font')break;} document.querySelectorAll('link[rel=stylesheet]').forEach(lk=>{const href=lk.href||''; if(href.indexOf('fonts')>=0) res.lk.push(href); if(res.ic.t==='font'&&res.ic.f){const k=res.ic.f.toLowerCase().replace(/\s+/g,''); if(href.toLowerCase().indexOf(k)>=0&&!res.ic.c.includes(href))res.ic.c.push(href);}}); for(let i=0;i<document.styleSheets.length;i++){try{const sh=document.styleSheets[i];const cs=sh.cssRules||sh.rules;if(!cs)continue;for(let j=0;j<cs.length;j++){const rr=cs[j];if(rr instanceof CSSFontFaceRule){const fam=rr.style.getPropertyValue('font-family').replace(/['"]/g,'').trim(); if(res.f.has(fam)res.ff.push(rr.cssText);}}}catch(e){}} }catch(e){} return res;}
        function gv(rs){ const u=new Set(); const re=/var\(\s*(--[^\s,)]+)\s*(?:,[^)]+)?\)/g; for(const r of rs){let m;const t=r.css||'';while((m=re.exec(t))!==null)u.add(m[1]);} const rt={}; try{ for(let i=0;i<document.styleSheets.length;i++){try{const sh=document.styleSheets[i];const cs=sh.cssRules||sh.rules;if(!cs)continue;for(let j=0;j<cs.length;j++){const rr=cs[j];if(!rr.selectorText)continue;if(rr.selectorText.indexOf(':root')>=0||rr.selectorText==='html'){const st=rr.style; for(let s=0;s<st.length;s){const n=st[s];if(n.indexOf('--')===0&&u.has(n)rt[n]=st.getPropertyValue(n).trim();}}} }catch(e){} } }catch(e){} return {u:[...u],rt};}
        function gs(el){ const st={}; const ps=[':hover',':focus',':focus-visible',':active',':visited','::before','::after']; try{ const shs=Array.from(document.styleSheets); for(const sh of shs){try{const cs=sh.cssRules||sh.rules;if(!cs)continue;for(let i=0;i<cs.length;i){const rr=cs[i];if(!(rr instanceof CSSStyleRule))continue;const sel=rr.selectorText;if(!sel)continue;for(const p of ps){if(sel.indexOf(p)>=0){const tag=el.tagName.toLowerCase();let ok=false;if(sel.indexOf(tag)>=0)ok=true;if(el.id&&sel.indexOf('#'+el.id)>=0)ok=true;for(let c=0;c<el.classList.length;c++){try{if(sel.indexOf('.'+CSS.escape(el.classList[c]))>=0)ok=true;}catch(e){if(sel.indexOf('.'+el.classList[c])>=0)ok=true;}} if(ok){if(!st[p])st[p]=[];st[p].push({sel,css:rr.style.cssText});}}}}}catch(e){} } }catch(e){} return st;}
        function extract(el){ try{ const m=getRules(el); const v=gv(m); const f=gf(el); const s=gs(el); let css=[]; if(v.rt&&Object.keys(v.rt).length){css.push(':root{'); for(const k in v.rt){css.push('  '+k+': '+v.rt[k]+';');} css.push('}'); css.push('');} for(const r of m){const c=cl(r.css); if(c){css.push(r.sel+'{'); c.split(';').forEach(x=>{if(x.trim())css.push('  '+x.trim()+';');}); css.push('}'); css.push('');}} if(s){for(const p in s){const list=s[p]; if(!list)continue; list.forEach(rule=>{const c=cl(rule.css); if(c){css.push(rule.sel+'{'); c.split(';').forEach(x=>{if(x.trim())css.push('  '+x.trim()+';');}); css.push('}'); css.push('');}});}} const bundle={id:'cbv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),name:(el.tagName.toLowerCase())+(el.id?'#'+el.id:'')+(el.classList&&el.classList[0]?'.'+el.classList[0]:''),createdAt:Date.now(),html:el.outerHTML,css:css.join('\n'),assets:{cssVars:v.rt||{},usedVars:v.u||[],fonts:f.ff||[],fontFamilies:[...f.f],icons:f.ic||{t:'n',f:null,c:[]},links:f.lk||[],svgs:f.sv||[]},meta:{tag:el.tagName.toLowerCase(),id:el.id||null,classes:el.classList?[...el.classList]:[]}}; chrome.runtime.sendMessage({type:'CBV_BUNDLE_READY', bundle}); }catch(e){chrome.runtime.sendMessage({type:'CBV_BUNDLE_ERROR', error:e.message});}}
      }
    });
    if (statusEl) statusEl.textContent = 'Picking... Click element on page • ESC to cancel';
  } catch (e) {
    if (statusEl) statusEl.textContent = 'Error: ' + (e.message || e);
  }
};

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg) return;
  if (msg.type === 'CBV_BUNDLE_READY') {
    currentBundle = msg.bundle;
    if (statusEl) statusEl.textContent = 'Bundle ready';
    renderAll();
    document.querySelector('.tab[data-tab="preview"]').click();
  }
  if (msg.type === 'CBV_BUNDLE_ERROR') {
    if (statusEl) statusEl.textContent = 'Error: ' + msg.error;
  }
});

function renderAll(){ if(!currentBundle)return; renderPreview(); renderAssets(); renderCode(); renderRaw(); }
function renderPreview(){ if(!previewFrame)return; previewFrame.innerHTML=''; const st=document.createElement('style'); st.textContent=currentBundle.css||''; previewFrame.appendChild(st); const w=document.createElement('div'); w.innerHTML=currentBundle.html||''; previewFrame.appendChild(w); }
function renderAssets(){ if(!assetsList)return; assetsList.innerHTML=''; const a=currentBundle.assets||{}; function mk(t,d){ const c=document.createElement('div'); c.className='asset-card'; c.innerHTML='<h4>'+t+'</h4><p>'+d+'</p>'; const l=document.createElement('div'); l.className='asset-list'; c.appendChild(l); return {c,l}; } const c1=mk('CSS Variables',''); const l1=c1.l; if(a.cssVars&&Object.keys(a.cssVars).length){for(const k in a.cssVars){const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>'+k+': '+a.cssVars[k]+'</span><button class="btn ghost">Copy</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText(k+': '+a.cssVars[k]);l1.appendChild(it);}}else{const e=document.createElement('div');e.className='asset-item';e.innerHTML='<span>None</span>';l1.appendChild(e);} assetsList.appendChild(c1.c); const c2=mk('Fonts',''); const l2=c2.l; if(a.fontFamilies){a.fontFamilies.forEach(f=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>'+f+'</span>';l2.appendChild(it);});} if(a.fonts){a.fonts.forEach(ff=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>@font-face</span><button class="btn ghost">Copy</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText(ff);l2.appendChild(it);});} if(a.icons&&a.icons.t==='font'){const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>ICON FONT</span>';l2.appendChild(it); if(a.icons.c){a.icons.c.forEach(c=>{const i2=document.createElement('div');i2.className='asset-item';i2.innerHTML='<span>'+c+'</span><button class="btn ghost">Copy</button>';i2.querySelector('button').onclick=()=>navigator.clipboard.writeText('<link rel="stylesheet" href="'+c+'">');l2.appendChild(i2);});}} assetsList.appendChild(c2.c); const c3=mk('CDN',''); const l3=c3.l; if(a.links){a.links.forEach(lk=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>'+lk+'</span><button class="btn ghost">Copy</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText('<link rel="stylesheet" href="'+lk+'">');l3.appendChild(it);});} assetsList.appendChild(c3.c); const c4=mk('SVG',''); const l4=c4.l; if(a.svgs){a.svgs.forEach((svg,idx)=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>svg'+(idx+1)+'</span><button class="btn ghost">Copy</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText(svg);l4.appendChild(it);});} assetsList.appendChild(c4.c); }
function renderCode(){ if(!currentBundle||!codeHtml||!codeCss||!codeAll)return; codeHtml.value=currentBundle.html||''; codeCss.value=currentBundle.css||''; const h=(currentBundle.assets&&currentBundle.assets.links&&currentBundle.assets.links.length)?currentBundle.assets.links.map(l=>'<!-- <link rel="stylesheet" href="'+l+'"> -->').join('\n'):''; codeAll.value=h+'\n<style>\n'+(currentBundle.css||'')+'\n</style>\n\n'+(currentBundle.html||''); }
function renderRaw(){ if(!currentBundle||!rawJson)return; rawJson.textContent=JSON.stringify(currentBundle,null,2); }
document.querySelectorAll('[data-copy]').forEach(btn=>{btn.addEventListener('click',async()=>{const t=btn.dataset.copy;if(t==='html'&&codeHtml)await navigator.clipboard.writeText(codeHtml.value);if(t==='css'&&codeCss)await navigator.clipboard.writeText(codeCss.value);if(t==='all'&&codeAll)await navigator.clipboard.writeText(codeAll.value);const old=btn.textContent;btn.textContent='Copied!';setTimeout(()=>btn.textContent=old,700);});});
if(btnSave){btnSave.addEventListener('click',async()=>{if(!currentBundle)return;try{await db.bundles.put(currentBundle);if(statusEl)statusEl.textContent='Saved';document.querySelector('.tab[data-tab="vault"]').click();renderVault();}catch(e){if(statusEl)statusEl.textContent='Err';}});}
if(vaultSearch)vaultSearch.addEventListener('input',renderVault);
async function renderVault(){if(!vaultList)return;const q=(vaultSearch.value||'').toLowerCase();let items=[];try{items=await db.bundles.orderBy('createdAt').reverse().toArray();}catch(e){items=[];}if(q)items=items.filter(i=>i.name&&i.name.toLowerCase().includes(q));vaultList.innerHTML='';if(items.length===0){const e=document.createElement('div');e.className='asset-item';e.innerHTML='<span>Empty</span>';vaultList.appendChild(e);return;}items.forEach(item=>{const el=document.createElement('div');el.className='vault-item';el.innerHTML='<div class="vault-head"><div><strong>'+item.name+'</strong><div class="vault-meta">'+(item.createdAt?new Date(item.createdAt).toLocaleString():'')+'</div></div><button class="btn ghost" data-load="'+item.id+'">Load</button></div><div class="vault-actions-row"><button class="btn ghost" data-vc="html:'+item.id+'">HTML</button><button class="btn ghost" data-vc="css:'+item.id+'">CSS</button><button class="btn primary" data-vc="all:'+item.id+'">All</button><button class="btn ghost" data-vd="'+item.id+'">Del</button></div>';vaultList.appendChild(el);});vaultList.querySelectorAll('[data-load]').forEach(b=>b.onclick=async()=>{const x=await db.bundles.get(b.dataset.load);if(x){currentBundle=x;if(statusEl)statusEl.textContent='Loaded';renderAll();document.querySelector('.tab[data-tab="preview"]').click();}});vaultList.querySelectorAll('[data-vc]').forEach(b=>b.onclick=async()=>{const p=b.dataset.vc.split(':');const t=p[0],id=p[1];const x=await db.bundles.get(id);if(!x)return;if(t==='html')await navigator.clipboard.writeText(x.html||'');if(t==='css')await navigator.clipboard.writeText(x.css||'');if(t==='all'){const h=(x.assets&&x.assets.links&&x.assets.links.length)?x.assets.links.map(l=>'<!-- <link rel="stylesheet" href="'+l+'"> -->').join('\n'):'';await navigator.clipboard.writeText(h+'\n<style>\n'+(x.css||'')+'\n</style>\n\n'+(x.html||''));}});vaultList.querySelectorAll('[data-vd]').forEach(b=>b.onclick=async()=>{await db.bundles.delete(b.dataset.vd);renderVault();});}

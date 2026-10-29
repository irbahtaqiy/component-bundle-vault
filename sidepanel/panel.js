import { initVault } from './vault.js';

const db = initVault();

const btnPick = document.getElementById('btn-pick');
const statusEl = document.getElementById('status');
const tabs = document.querySelectorAll('.tab');
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

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    const v = document.getElementById('view-' + tab.dataset.tab);
    if (v) v.classList.add('active');
    if (tab.dataset.tab === 'vault') renderVault();
  });
});

btnPick.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) { if(statusEl) statusEl.textContent = 'No active tab'; return; }
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
      if(statusEl) statusEl.textContent = 'Cannot run on this page'; return;
    }
    if(statusEl) statusEl.textContent = 'Injecting...';
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/picker.js', 'content/extractor-global.js', 'content/content.js'] });
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'CBV_START_PICKER' });
        if(statusEl) statusEl.textContent = 'Picking... Click element on page • Esc to cancel';
      } catch (e) {
        if(statusEl) statusEl.textContent = 'Failed to start picker';
      }
    }, 200);
  } catch (e) {
    if(statusEl) statusEl.textContent = 'Error: ' + (e.message||e);
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if(!msg) return;
  if(msg.type==='CBV_BUNDLE_READY'){ currentBundle=msg.bundle; if(statusEl)statusEl.textContent='Bundle ready • Check Preview/Assets/Code'; renderAll(); const p=document.querySelector('.tab[data-tab="preview"]'); if(p)p.click(); }
  if(msg.type==='CBV_BUNDLE_ERROR'){ if(statusEl)statusEl.textContent='Error: '+msg.error; }
});

function renderAll(){ if(!currentBundle)return; renderPreview(); renderAssets(); renderCode(); renderRaw(); }
function renderPreview(){ if(!previewFrame)return; previewFrame.innerHTML=''; const style=document.createElement('style'); style.textContent=currentBundle.css||''; previewFrame.appendChild(style); const wrap=document.createElement('div'); wrap.innerHTML=currentBundle.html||''; previewFrame.appendChild(wrap); }
function renderAssets(){ if(!assetsList)return; assetsList.innerHTML=''; const a=currentBundle.assets||{}; const mk=(t,d)=>{const c=document.createElement('div');c.className='asset-card';c.innerHTML='<h4>'+t+'</h4><p>'+d+'</p>';const l=document.createElement('div');l.className='asset-list';c.appendChild(l);return{c,l};}; const c1=mk('CSS Variables','Variables yang dipake'); const l1=c1.l; if(a.cssVars&&Object.keys(a.cssVars).length){for(const k in a.cssVars){const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>'+k+': '+a.cssVars[k]+'</span><button class="btn ghost">Copy</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText(k+': '+a.cssVars[k]);l1.appendChild(it);}}else{const e=document.createElement('div');e.className='asset-item';e.innerHTML='<span>None detected</span>';l1.appendChild(e);} assetsList.appendChild(c1.c); const c2=mk('Fonts & Icon Fonts','Perlu diperhatiin'); const l2=c2.l; if(a.fontFamilies){a.fontFamilies.forEach(f=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>font-family: '+f+'</span>';l2.appendChild(it);});} if(a.fonts){a.fonts.forEach(ff=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>@font-face</span><button class="btn ghost">Copy</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText(ff);l2.appendChild(it);});} if(a.icons&&a.icons.type==='font'){const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>ICON FONT • '+(a.icons.family||'')+'</span>';l2.appendChild(it); if(a.icons.cdn){a.icons.cdn.forEach(c=>{const i2=document.createElement('div');i2.className='asset-item';i2.innerHTML='<span>'+c+'</span><button class="btn ghost">Copy link</button>';i2.querySelector('button').onclick=()=>navigator.clipboard.writeText('<link rel="stylesheet" href="'+c+'">');l2.appendChild(i2);});}} assetsList.appendChild(c2.c); const c3=mk('CDN Links','External'); const l3=c3.l; if(a.links&&a.links.length){a.links.forEach(lk=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>'+lk+'</span><button class="btn ghost">Copy</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText('<link rel="stylesheet" href="'+lk+'">');l3.appendChild(it);});}else{const e=document.createElement('div');e.className='asset-item';e.innerHTML='<span>None detected</span>';l3.appendChild(e);} assetsList.appendChild(c3.c); const c4=mk('Inline SVG','SVG kebawa'); const l4=c4.l; if(a.svgs&&a.svgs.length){a.svgs.forEach((svg,idx)=>{const it=document.createElement('div');it.className='asset-item';it.innerHTML='<span>svg #'+(idx+1)+'</span><button class="btn ghost">Copy SVG</button>';it.querySelector('button').onclick=()=>navigator.clipboard.writeText(svg);l4.appendChild(it);});}else{const e=document.createElement('div');e.className='asset-item';e.innerHTML='<span>None detected</span>';l4.appendChild(e);} assetsList.appendChild(c4.c); }
function renderCode(){ if(!currentBundle||!codeHtml||!codeCss||!codeAll)return; codeHtml.value=currentBundle.html||''; codeCss.value=currentBundle.css||''; const hints=(currentBundle.assets&&currentBundle.assets.links&&currentBundle.assets.links.length)?currentBundle.assets.links.map(l=>'<!-- <link rel="stylesheet" href="'+l+'"> -->').join('\n'):'<!-- No external font/css links detected -->'; codeAll.value='<!-- Component Bundle Vault: '+currentBundle.name+' -->\n<!-- ASSETS TO CHECK -->\n'+hints+'\n\n<style>\n'+(currentBundle.css||'')+'\n</style>\n\n'+(currentBundle.html||''); }
function renderRaw(){ if(!currentBundle||!rawJson)return; rawJson.textContent=JSON.stringify(currentBundle,null,2); }
document.querySelectorAll('[data-copy]').forEach(btn=>{ btn.addEventListener('click',async()=>{ const t=btn.dataset.copy; if(t==='html'&&codeHtml) await navigator.clipboard.writeText(codeHtml.value); if(t==='css'&&codeCss) await navigator.clipboard.writeText(codeCss.value); if(t==='all'&&codeAll) await navigator.clipboard.writeText(codeAll.value); const old=btn.textContent; btn.textContent='Copied!'; setTimeout(()=>btn.textContent=old,900); }); });
if(btnSave){ btnSave.addEventListener('click',async()=>{ if(!currentBundle)return; try{ await db.bundles.put(currentBundle); if(statusEl)statusEl.textContent='Saved to Vault'; document.querySelector('.tab[data-tab="vault"]').click(); renderVault(); }catch(e){ if(statusEl)statusEl.textContent='Error saving: '+e.message; } }); }
if(vaultSearch) vaultSearch.addEventListener('input',renderVault);
async function renderVault(){ if(!vaultList)return; const q=((vaultSearch&&vaultSearch.value)||'').toLowerCase(); let items=[]; try{ items=await db.bundles.orderBy('createdAt').reverse().toArray(); }catch(e){items=[];} if(q){ items=items.filter(i=>(i.name&&i.name.toLowerCase().includes(q))||JSON.stringify(i.meta||{}).toLowerCase().includes(q)); } vaultList.innerHTML=''; if(items.length===0){ const e=document.createElement('div'); e.className='asset-item'; e.innerHTML='<span>No bundles saved yet</span>'; vaultList.appendChild(e); return; } items.forEach(item=>{ const el=document.createElement('div'); el.className='vault-item'; el.innerHTML='<div class="vault-head"><div><strong>'+(item.name||'Unnamed')+'</strong><div class="vault-meta">'+(item.createdAt?new Date(item.createdAt).toLocaleString():'')+'</div></div><button class="btn ghost" data-load="'+item.id+'">Load</button></div><div class="vault-actions-row"><button class="btn ghost" data-vcopy="html:'+item.id+'">Copy HTML</button><button class="btn ghost" data-vcopy="css:'+item.id+'">Copy CSS</button><button class="btn primary" data-vcopy="all:'+item.id+'">Copy All-in-one</button><button class="btn ghost" data-del="'+item.id+'">Delete</button></div>'; vaultList.appendChild(el); }); vaultList.querySelectorAll('[data-load]').forEach(btn=>btn.addEventListener('click',async()=>{ const id=btn.dataset.load; const b=await db.bundles.get(id); if(!b)return; currentBundle=b; if(statusEl)statusEl.textContent='Loaded from Vault'; renderAll(); document.querySelector('.tab[data-tab="preview"]').click(); })); vaultList.querySelectorAll('[data-vcopy]').forEach(btn=>btn.addEventListener('click',async()=>{ const p2=btn.dataset.vcopy.split(':'); const type=p2[0], id=p2.slice(1).join(':'); const b=await db.bundles.get(id); if(!b)return; if(type==='html') await navigator.clipboard.writeText(b.html||''); if(type==='css') await navigator.clipboard.writeText(b.css||''); if(type==='all'){ const hints=(b.assets&&b.assets.links&&b.assets.links.length)?b.assets.links.map(l=>'<!-- <link rel="stylesheet" href="'+l+'"> -->').join('\n'):'<!-- No external font/css links detected -->'; await navigator.clipboard.writeText('<!-- '+b.name+' -->\n'+hints+'\n\n<style>\n'+(b.css||'')+'\n</style>\n\n'+(b.html||'')); } const old=btn.textContent; btn.textContent='Copied!'; setTimeout(()=>btn.textContent=old,900); })); vaultList.querySelectorAll('[data-del]').forEach(btn=>btn.addEventListener('click',async()=>{ const id=btn.dataset.del; await db.bundles.delete(id); renderVault(); })); }

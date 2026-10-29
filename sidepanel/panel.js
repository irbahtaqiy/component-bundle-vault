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
    document.getElementById('view-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'vault') renderVault();
  });
});

btnPick.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;
  statusEl.textContent = 'Picking... Click element on page • Esc to cancel';
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'CBV_START_PICKER' });
  } catch (e) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js']
      });
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { type: 'CBV_START_PICKER' });
        } catch (e2) {}
      }, 200);
    } catch (e2) {}
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'CBV_BUNDLE_READY') {
    currentBundle = msg.bundle;
    statusEl.textContent = 'Bundle ready • Check Preview/Assets/Code';
    renderAll();
    document.querySelector('.tab[data-tab="preview"]').click();
  }
  if (msg.type === 'CBV_BUNDLE_ERROR') {
    statusEl.textContent = 'Error: ' + msg.error;
  }
});

function renderAll() {
  if (!currentBundle) return;
  renderPreview();
  renderAssets();
  renderCode();
  renderRaw();
}

function renderPreview() {
  previewFrame.innerHTML = '';
  const style = document.createElement('style');
  style.textContent = currentBundle.css || '';
  previewFrame.appendChild(style);
  const wrap = document.createElement('div');
  wrap.innerHTML = currentBundle.html || '';
  previewFrame.appendChild(wrap);
}

function renderAssets() {
  assetsList.innerHTML = '';
  const a = currentBundle.assets || {};

  const card1 = document.createElement('div');
  card1.className = 'asset-card';
  card1.innerHTML = `<h4>CSS Variables</h4><p>Variables yang dipake komponen ini</p>`;
  const list1 = document.createElement('div');
  list1.className = 'asset-list';
  if (a.cssVars && Object.keys(a.cssVars).length) {
    for (const k in a.cssVars) {
      const item = document.createElement('div');
      item.className = 'asset-item';
      item.innerHTML = `<span>${k}: ${a.cssVars[k]}</span><button class="btn ghost" data-copy-var="${k}: ${a.cssVars[k]}">Copy</button>`;
      item.querySelector('button').addEventListener('click', () => navigator.clipboard.writeText(`${k}: ${a.cssVars[k]}`));
      list1.appendChild(item);
    }
  } else {
    const empty = document.createElement('div');
    empty.className = 'asset-item';
    empty.innerHTML = '<span>None detected</span>';
    list1.appendChild(empty);
  }
  card1.appendChild(list1);
  assetsList.appendChild(card1);

  const card2 = document.createElement('div');
  card2.className = 'asset-card';
  card2.innerHTML = `<h4>Fonts & Icon Fonts</h4><p>Wajib diperhatiin biar ga ilang</p>`;
  const list2 = document.createElement('div');
  list2.className = 'asset-list';
  if (a.fontFamilies && a.fontFamilies.length) {
    a.fontFamilies.forEach(f => {
      const item = document.createElement('div');
      item.className = 'asset-item';
      item.innerHTML = `<span>font-family: ${f}</span>`;
      list2.appendChild(item);
    });
  }
  if (a.fonts && a.fonts.length) {
    a.fonts.forEach(ff => {
      const item = document.createElement('div');
      item.className = 'asset-item';
      item.innerHTML = `<span>@font-face</span><button class="btn ghost">Copy</button>`;
      item.querySelector('button').addEventListener('click', () => navigator.clipboard.writeText(ff));
      list2.appendChild(item);
    });
  }
  if (a.icons && a.icons.type === 'font') {
    const item = document.createElement('div');
    item.className = 'asset-item';
    item.innerHTML = `<span>ICON FONT • ${a.icons.family || ''}</span>`;
    list2.appendChild(item);
    if (a.icons.cdn && a.icons.cdn.length) {
      a.icons.cdn.forEach(c => {
        const it = document.createElement('div');
        it.className = 'asset-item';
        it.innerHTML = `<span>${c}</span><button class="btn ghost">Copy link</button>`;
        it.querySelector('button').addEventListener('click', () => navigator.clipboard.writeText(`<link rel="stylesheet" href="${c}">`));
        list2.appendChild(it);
      });
    }
  }
  card2.appendChild(list2);
  assetsList.appendChild(card2);

  const card3 = document.createElement('div');
  card3.className = 'asset-card';
  card3.innerHTML = `<h4>CDN Links</h4><p>Fonts/Assets dari external stylesheet</p>`;
  const list3 = document.createElement('div');
  list3.className = 'asset-list';
  if (a.links && a.links.length) {
    a.links.forEach(l => {
      const item = document.createElement('div');
      item.className = 'asset-item';
      item.innerHTML = `<span>${l}</span><button class="btn ghost">Copy</button>`;
      item.querySelector('button').addEventListener('click', () => navigator.clipboard.writeText(`<link rel="stylesheet" href="${l}">`));
      list3.appendChild(item);
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'asset-item';
    empty.innerHTML = '<span>None detected</span>';
    list3.appendChild(empty);
  }
  card3.appendChild(list3);
  assetsList.appendChild(card3);

  const card4 = document.createElement('div');
  card4.className = 'asset-card';
  card4.innerHTML = `<h4>Inline SVG</h4><p>Icon SVG yang kebawa</p>`;
  const list4 = document.createElement('div');
  list4.className = 'asset-list';
  if (a.svgs && a.svgs.length) {
    a.svgs.forEach((svg, idx) => {
      const item = document.createElement('div');
      item.className = 'asset-item';
      item.innerHTML = `<span>svg #${idx+1}</span><button class="btn ghost">Copy SVG</button>`;
      item.querySelector('button').addEventListener('click', () => navigator.clipboard.writeText(svg));
      list4.appendChild(item);
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'asset-item';
    empty.innerHTML = '<span>None detected</span>';
    list4.appendChild(empty);
  }
  card4.appendChild(list4);
  assetsList.appendChild(card4);
}

function renderCode() {
  if (!currentBundle) return;
  codeHtml.value = currentBundle.html || '';
  codeCss.value = currentBundle.css || '';

  const linksHints = (currentBundle.assets && currentBundle.assets.links && currentBundle.assets.links.length)
    ? currentBundle.assets.links.map(l=>`<!-- <link rel="stylesheet" href="${l}"> -->`).join('\n')
    : '<!-- No external font/css links detected -->';

  const all = `<!-- Component Bundle Vault: ${currentBundle.name} -->\n<!-- ASSETS TO CHECK -->\n${linksHints}\n\n<style>\n${currentBundle.css || ''}\n</style>\n\n${currentBundle.html || ''}`;
  codeAll.value = all;
}

function renderRaw() {
  if (!currentBundle) return;
  rawJson.textContent = JSON.stringify(currentBundle, null, 2);
}

document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const type = btn.dataset.copy;
    if (type === 'html') await navigator.clipboard.writeText(codeHtml.value);
    if (type === 'css') await navigator.clipboard.writeText(codeCss.value);
    if (type === 'all') await navigator.clipboard.writeText(codeAll.value);
    const old = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = old, 900);
  });
});

btnSave.addEventListener('click', async () => {
  if (!currentBundle) return;
  try {
    await db.bundles.put(currentBundle);
    statusEl.textContent = 'Saved to Vault';
    document.querySelector('.tab[data-tab="vault"]').click();
  } catch (e) {
    statusEl.textContent = 'Error saving: ' + e.message;
  }
});

if (vaultSearch) vaultSearch.addEventListener('input', renderVault);

async function renderVault() {
  const q = ((vaultSearch && vaultSearch.value) || '').toLowerCase();
  let items = [];
  try {
    items = await db.bundles.orderBy('createdAt').reverse().toArray();
  } catch (e) {
    items = [];
  }
  if (q) {
    items = items.filter(i => (i.name && i.name.toLowerCase().includes(q)) || JSON.stringify(i.meta || {}).toLowerCase().includes(q));
  }
  vaultList.innerHTML = '';
  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'asset-item';
    empty.innerHTML = '<span>No bundles saved yet</span>';
    vaultList.appendChild(empty);
    return;
  }
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'vault-item';
    el.innerHTML = `
      <div class="vault-head">
        <div>
          <strong>${item.name || 'Unnamed'}</strong>
          <div class="vault-meta">${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</div>
        </div>
        <button class="btn ghost" data-load="${item.id}">Load</button>
      </div>
      <div class="vault-actions-row">
        <button class="btn ghost" data-vcopy="html:${item.id}">Copy HTML</button>
        <button class="btn ghost" data-vcopy="css:${item.id}">Copy CSS</button>
        <button class="btn primary" data-vcopy="all:${item.id}">Copy All-in-one</button>
        <button class="btn ghost" data-del="${item.id}">Delete</button>
      </div>
    `;
    vaultList.appendChild(el);
  });

  vaultList.querySelectorAll('[data-load]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.load;
      const b = await db.bundles.get(id);
      if (!b) return;
      currentBundle = b;
      statusEl.textContent = 'Loaded from Vault';
      renderAll();
      document.querySelector('.tab[data-tab="preview"]').click();
    });
  });

  vaultList.querySelectorAll('[data-vcopy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const [type, id] = btn.dataset.vcopy.split(':');
      const b = await db.bundles.get(id);
      if (!b) return;
      if (type === 'html') await navigator.clipboard.writeText(b.html || '');
      if (type === 'css') await navigator.clipboard.writeText(b.css || '');
      if (type === 'all') {
        const linksHints = (b.assets && b.assets.links && b.assets.links.length)
          ? b.assets.links.map(l=>`<!-- <link rel="stylesheet" href="${l}"> -->`).join('\n')
          : '<!-- No external font/css links detected -->';
        const all = `<!-- Component Bundle Vault: ${b.name} -->\n<!-- ASSETS TO CHECK -->\n${linksHints}\n\n<style>\n${b.css || ''}\n</style>\n\n${b.html || ''}`;
        await navigator.clipboard.writeText(all);
      }
      const old = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = old, 900);
    });
  });

  vaultList.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.del;
      await db.bundles.delete(id);
      renderVault();
    });
  });
}

(() => {
  if (window.__CBV_PICKER_ACTIVE__) return;
  window.__CBV_PICKER_ACTIVE__ = true;

  const state = {
    active: true,
    hovered: null,
    overlay: null
  };

  const overlay = document.createElement('div');
  overlay.className = 'cbv-picker-overlay';
  overlay.textContent = 'CBV • Click element to bundle • Esc to cancel';
  document.body.appendChild(overlay);
  state.overlay = overlay;

  function onMouseOver(e) {
    if (!state.active) return;
    const el = e.target;
    if (el === overlay) return;
    if (state.hovered && state.hovered !== el) {
      state.hovered.classList.remove('cbv-highlight-hover');
    }
    state.hovered = el;
    el.classList.add('cbv-highlight-hover');
  }

  function onMouseOut(e) {
    if (!state.active) return;
    const el = e.target;
    if (el.classList && el.classList.contains('cbv-highlight-hover')) {
      el.classList.remove('cbv-highlight-hover');
    }
  }

  function onClick(e) {
    if (!state.active) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const el = e.target;
    if (el === overlay) return;

    cleanup();

    window.postMessage({ type: 'CBV_PICKED_ELEMENT', target: true }, '*');
    const ev = new CustomEvent('cbv:pick', { detail: { el: getSelectorPath(el) } });
    document.dispatchEvent(ev);
    window.__CBV_SELECTED_EL__ = el;
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
      window.postMessage({ type: 'CBV_PICKER_CANCEL' }, '*');
    }
  }

  function cleanup() {
    state.active = false;
    window.__CBV_PICKER_ACTIVE__ = false;
    if (state.hovered && state.hovered.classList) {
      state.hovered.classList.remove('cbv-highlight-hover');
    }
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('mouseout', onMouseOut, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function getSelectorPath(el) {
    if (!(el instanceof Element)) return '';
    const path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + CSS.escape(el.id);
        path.unshift(selector);
        break;
      }
      let sib = el, nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() === el.nodeName.toLowerCase()) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
      path.unshift(selector);
      el = el.parentNode;
      if (!el || el.nodeType !== Node.ELEMENT_NODE) break;
    }
    return path.join(' > ');
  }

  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('mouseout', onMouseOut, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
})();

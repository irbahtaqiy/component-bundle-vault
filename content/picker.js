(function(){
  if (window.__CBV_PICKER_ACTIVE__) return;
  window.__CBV_PICKER_ACTIVE__ = true;

  const overlay = document.createElement('div');
  overlay.className = 'cbv-picker-overlay';
  overlay.textContent = 'CBV • Click element to bundle • Esc to cancel';
  document.body.appendChild(overlay);

  let hovered = null;

  function onMouseOver(e) {
    const el = e.target;
    if (!el || el === overlay) return;
    if (hovered && hovered !== el && hovered.classList) {
      hovered.classList.remove('cbv-highlight-hover');
    }
    hovered = el;
    if (el.classList) el.classList.add('cbv-highlight-hover');
  }

  function onMouseOut(e) {
    const el = e.target;
    if (el && el.classList) el.classList.remove('cbv-highlight-hover');
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const el = e.target;
    if (!el || el === overlay) return;
    cleanup();
    window.__CBV_SELECTED_EL__ = el;
    document.dispatchEvent(new CustomEvent('cbv:pick'));
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
      try { chrome.runtime.sendMessage({ type: 'CBV_PICKER_CANCEL' }); } catch(ex){}
    }
  }

  function cleanup() {
    window.__CBV_PICKER_ACTIVE__ = false;
    if (hovered && hovered.classList) hovered.classList.remove('cbv-highlight-hover');
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('mouseout', onMouseOut, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('mouseout', onMouseOut, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
})();

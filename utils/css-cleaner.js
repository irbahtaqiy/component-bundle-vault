const USEFUL_PROPS = new Set([
  'display','position','top','right','bottom','left','inset',
  'flex','flex-direction','flex-wrap','align-items','justify-content','gap','row-gap','column-gap',
  'grid','grid-template-columns','grid-template-rows','place-items','place-content',
  'width','height','min-width','max-width','min-height','max-height',
  'margin','margin-top','margin-right','margin-bottom','margin-left',
  'padding','padding-top','padding-right','padding-bottom','padding-left',
  'box-sizing','border','border-width','border-style','border-color','border-radius','border-top','border-right','border-bottom','border-left',
  'background','background-color','background-image','background-size','background-position','background-repeat',
  'color','font-family','font-size','font-weight','line-height','letter-spacing','text-align','text-decoration','text-transform','white-space','vertical-align',
  'opacity','box-shadow','filter','backdrop-filter',
  'cursor','user-select','pointer-events',
  'transition','transform','animation','transform-origin',
  'overflow','overflow-x','overflow-y',
  'z-index','visibility','appearance','outline','outline-offset'
]);

export function cleanCssText(cssText) {
  if (!cssText) return '';
  const parts = cssText.split(';');
  const out = [];
  for (let p of parts) {
    const t = p.trim();
    if (!t) continue;
    const idx = t.indexOf(':');
    if (idx === -1) continue;
    const prop = t.substring(0, idx).trim();
    const rest = t.substring(idx + 1).trim();
    if (!rest) continue;
    if (USEFUL_PROPS.has(prop)) {
      out.push(prop + ': ' + rest);
    } else if (prop.startsWith('--')) {
      out.push(prop + ': ' + rest);
    }
  }
  return out.join('; ');
}

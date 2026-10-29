export function extractStates(element) {
  const states = {};
  const pseudo = [':hover', ':focus', ':focus-visible', ':active', ':visited', '::before', '::after'];
  try {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          if (rule instanceof CSSStyleRule) {
            const sel = rule.selectorText;
            if (!sel) continue;
            for (const p of pseudo) {
              if (sel.includes(p)) {
                if (matchesPseudo(sel, element)) {
                  if (!states[p]) states[p] = [];
                  states[p].push({ selector: sel, cssText: rule.style.cssText });
                }
              }
            }
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
  return states;
}

function matchesPseudo(selector, element) {
  const tag = element.tagName.toLowerCase();
  if (selector.includes(tag)) return true;
  if (element.id && selector.includes('#' + element.id)) return true;
  for (let i = 0; i < element.classList.length; i++) {
    const c = element.classList[i];
    try {
      if (selector.includes('.' + CSS.escape(c))) return true;
    } catch (e) {
      if (selector.includes('.' + c)) return true;
    }
  }
  return false;
}

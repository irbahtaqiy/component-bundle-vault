export function collectCssVars(matchedRules) {
  const used = new Set();
  const varRegex = /var\(\s*(--[A-Za-z0-9-_]+)\s*(?:,[^)]+)?\)/g;

  for (const rule of matchedRules || []) {
    let m;
    const cssText = rule.cssText || '';
    while ((m = varRegex.exec(cssText)) !== null) {
      used.add(m[1]);
    }
  }

  const rootVars = {};
  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let r = 0; r < rules.length; r++) {
          const rule = rules[r];
          if (!rule.selectorText) continue;
          if (rule.selectorText.includes(':root') || rule.selectorText === 'html') {
            const style = rule.style;
            for (let s = 0; s < style.length; s++) {
              const name = style[s];
              if (name.startsWith('--') && used.has(name)) {
                rootVars[name] = style.getPropertyValue(name).trim();
              }
            }
          }
          if (rule.selectorText.includes('[data-theme]')) {
            const style = rule.style;
            for (let s = 0; s < style.length; s++) {
              const name = style[s];
              if (name.startsWith('--') && used.has(name)) {
                rootVars[name] = style.getPropertyValue(name).trim();
              }
            }
          }
        }
      } catch (e) {}
    }
  } catch (e) {}

  return { used: Array.from(used), root: rootVars };
}

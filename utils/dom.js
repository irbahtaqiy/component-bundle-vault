export function getMatchedCssRules(element) {
  const rules = [];
  try {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        if (sheet.href && sheet.href.startsWith('chrome-extension://')) continue;
        const cssRules = sheet.cssRules || sheet.rules;
        if (!cssRules) continue;
        for (let i = 0; i < cssRules.length; i++) {
          const rule = cssRules[i];
          if (rule instanceof CSSStyleRule) {
            try {
              if (element.matches(rule.selectorText)) {
                rules.push({
                  selector: rule.selectorText,
                  cssText: rule.style.cssText,
                  style: rule.style
                });
              }
            } catch (e) {}
          } else if (rule instanceof CSSMediaRule) {
            try {
              const inner = rule.cssRules;
              for (let j = 0; j < inner.length; j++) {
                const r2 = inner[j];
                if (r2 instanceof CSSStyleRule) {
                  try {
                    if (element.matches(r2.selectorText)) {
                      rules.push({
                        selector: r2.selectorText,
                        cssText: r2.style.cssText,
                        style: r2.style,
                        media: rule.conditionText
                      });
                    }
                  } catch (e) {}
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {
        // cross-origin
      }
    }
  } catch (e) {}
  return rules;
}

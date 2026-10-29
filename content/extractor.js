import { getMatchedCssRules } from '../utils/dom.js';
import { collectCssVars } from '../utils/css-vars.js';
import { detectFontsAndIcons } from '../utils/font-detector.js';
import { extractStates } from '../utils/state-extractor.js';
import { cleanCssText } from '../utils/css-cleaner.js';

export function buildBundle(element) {
  if (!(element instanceof Element)) throw new Error('Invalid element');

  const matched = getMatchedCssRules(element);
  const vars = collectCssVars(matched);
  const fonts = detectFontsAndIcons(element);
  const states = extractStates(element);

  let cssLines = [];

  if (vars.root && Object.keys(vars.root).length) {
    cssLines.push(':root {');
    for (const k in vars.root) {
      cssLines.push(`  ${k}: ${vars.root[k]};`);
    }
    cssLines.push('}');
    cssLines.push('');
  }

  for (const rule of matched) {
    const cleaned = cleanCssText(rule.cssText);
    if (cleaned) {
      cssLines.push(`${rule.selector} {`);
      cleaned.split(';').forEach(c => {
        if (c.trim()) cssLines.push(`  ${c.trim()};`);
      });
      cssLines.push('}');
      cssLines.push('');
    }
  }

  if (states) {
    for (const p in states) {
      const list = states[p];
      if (!list) continue;
      list.forEach(s => {
        const cleaned = cleanCssText(s.cssText);
        if (cleaned) {
          cssLines.push(`${s.selector} {`);
          cleaned.split(';').forEach(c => {
            if (c.trim()) cssLines.push(`  ${c.trim()};`);
          });
          cssLines.push('}');
          cssLines.push('');
        }
      });
    }
  }

  const cssBundle = cssLines.join('\n');

  const bundle = {
    id: 'cbv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6),
    name: (element.tagName.toLowerCase()) + (element.id ? '#' + element.id : '') + (element.classList && element.classList[0] ? '.' + element.classList[0] : ''),
    createdAt: Date.now(),
    html: element.outerHTML,
    css: cssBundle,
    assets: {
      cssVars: vars.root || {},
      usedVars: vars.used || [],
      fonts: fonts.fontFaces || [],
      fontFamilies: Array.from(fonts.families || []),
      icons: fonts.icons || { type: 'none', family: null, cdn: [] },
      links: fonts.links || [],
      svgs: fonts.svgs || []
    },
    meta: {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: element.classList ? Array.from(element.classList) : [],
      selectorHint: ''
    }
  };

  return bundle;
}

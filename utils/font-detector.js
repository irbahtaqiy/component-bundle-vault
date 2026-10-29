const ICON_FAMILIES = [
  'Material Symbols',
  'Material Symbols Outlined',
  'Material Symbols Rounded',
  'Material Symbols Sharp',
  'Font Awesome',
  'FontAwesome',
  'fa-solid',
  'fa-regular',
  'fa-brands',
  'Phosphor',
  'phosphor',
  'Remix Icon',
  'remixicon',
  'Lucide',
  'bootstrap-icons'
];

export function detectFontsAndIcons(element) {
  const result = {
    families: new Set(),
    fontFaces: [],
    links: [],
    icons: { type: 'none', family: null, cdn: [] },
    svgs: []
  };

  try {
    const cs = getComputedStyle(element);
    const ff = cs.getPropertyValue('font-family');
    if (ff) {
      ff.split(',').forEach(f => {
        const clean = f.trim().replace(/['"]/g, '');
        if (clean && clean !== 'inherit' && clean !== 'initial') result.families.add(clean);
      });
    }

    element.querySelectorAll('*').forEach(child => {
      try {
        const ccs = getComputedStyle(child);
        const cff = ccs.getPropertyValue('font-family');
        if (cff) {
          cff.split(',').forEach(f => {
            const clean = f.trim().replace(/['"]/g, '');
            if (clean && clean !== 'inherit') result.families.add(clean);
          });
        }
        if (child.tagName === 'svg') {
          result.svgs.push(child.outerHTML);
        }
      } catch (e) {}
    });

    for (const fam of result.families) {
      for (const iconFam of ICON_FAMILIES) {
        if (fam.toLowerCase().includes(iconFam.toLowerCase())) {
          result.icons.type = 'font';
          result.icons.family = fam;
          break;
        }
      }
      if (result.icons.type === 'font') break;
    }

    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    links.forEach(link => {
      const href = link.href || '';
      if (href.includes('fonts.googleapis.com') || href.includes('fonts.bunny.net') || href.includes('use.typekit.net')) {
        result.links.push(href);
      }
      if (result.icons.type === 'font' && result.icons.family) {
        const famKey = result.icons.family.toLowerCase().replace(/\s+/g, '');
        if (href.toLowerCase().includes(famKey)) {
          if (!result.icons.cdn.includes(href)) result.icons.cdn.push(href);
        }
      }
    });

    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let r = 0; r < rules.length; r++) {
          const rule = rules[r];
          if (rule instanceof CSSFontFaceRule) {
            const ffam = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim();
            if (result.families.has(ffam)) {
              result.fontFaces.push(rule.cssText);
            }
          }
        }
      } catch (e) {}
    }
  } catch (e) {}

  return result;
}

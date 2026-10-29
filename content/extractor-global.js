(function(){
  if (window.CBV_buildBundle) return;

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

  function cleanCssText(cssText){
    if(!cssText) return '';
    const parts = cssText.split(';');
    const out=[];
    for(let p of parts){
      const t=p.trim();
      if(!t) continue;
      const idx=t.indexOf(':');
      if(idx===-1) continue;
      const prop=t.substring(0,idx).trim();
      const rest=t.substring(idx+1).trim();
      if(!rest) continue;
      if(USEFUL_PROPS.has(prop) || prop.startsWith('--')) out.push(prop+': '+rest);
    }
    return out.join('; ');
  }

  function getMatchedCssRules(element){
    const rules=[];
    try{
      const sheets=Array.from(document.styleSheets);
      for(const sheet of sheets){
        try{
          if(sheet.href && sheet.href.startsWith('chrome-extension://')) continue;
          const cssRules = sheet.cssRules || sheet.rules;
          if(!cssRules) continue;
          for(let i=0;i<cssRules.length;i++){
            const rule=cssRules[i];
            if(rule instanceof CSSStyleRule){
              try{
                if(element.matches(rule.selectorText)){
                  rules.push({selector:rule.selectorText, cssText:rule.style.cssText});
                }
              }catch(e){}
            }else if(rule instanceof CSSMediaRule){
              try{
                const inner=rule.cssRules;
                for(let j=0;j<inner.length;j++){
                  const r2=inner[j];
                  if(r2 instanceof CSSStyleRule){
                    try{
                      if(element.matches(r2.selectorText)){
                        rules.push({selector:r2.selectorText, cssText:r2.style.cssText, media:rule.conditionText});
                      }
                    }catch(e){}
                  }
                }
              }catch(e){}
            }
          }
        }catch(e){}
      }
    }catch(e){}
    return rules;
  }

  const ICON_FAMILIES=['Material Symbols','Material Symbols Outlined','Material Symbols Rounded','Material Symbols Sharp','Font Awesome','FontAwesome','fa-solid','fa-regular','fa-brands','Phosphor','phosphor','Remix Icon','remixicon','Lucide','bootstrap-icons'];
  function detectFontsAndIcons(element){
    const result={families:new Set(), fontFaces:[], links:[], icons:{type:'none',family:null,cdn:[]}, svgs:[]};
    try{
      const cs=getComputedStyle(element);
      const ff=cs.getPropertyValue('font-family');
      if(ff){ ff.split(',').forEach(f=>{const clean=f.trim().replace(/['"]/g,''); if(clean&&clean!=='inherit'&&clean!=='initial') result.families.add(clean);}); }
      element.querySelectorAll('*').forEach(child=>{
        try{
          const ccs=getComputedStyle(child);
          const cff=ccs.getPropertyValue('font-family');
          if(cff){ cff.split(',').forEach(f=>{const clean=f.trim().replace(/['"]/g,''); if(clean&&clean!=='inherit') result.families.add(clean);}); }
          if(child.tagName==='svg') result.svgs.push(child.outerHTML);
        }catch(e){}
      });
      for(const fam of result.families){
        for(const iconFam of ICON_FAMILIES){ if(fam.toLowerCase().includes(iconFam.toLowerCase())){ result.icons.type='font'; result.icons.family=fam; break; } }
        if(result.icons.type==='font') break;
      }
      const links=Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      links.forEach(link=>{
        const href=link.href||'';
        if(href.includes('fonts.googleapis.com')||href.includes('fonts.bunny.net')||href.includes('use.typekit.net')) result.links.push(href);
        if(result.icons.type==='font'&&result.icons.family){ const k=result.icons.family.toLowerCase().replace(/\s+/g,''); if(href.toLowerCase().includes(k)) if(!result.icons.cdn.includes(href)) result.icons.cdn.push(href); }
      });
      for(let i=0;i<document.styleSheets.length;i++){
        try{
          const sheet=document.styleSheets[i];
          const rules=sheet.cssRules||sheet.rules; if(!rules) continue;
          for(let r=0;r<rules.length;r++){
            const rule=rules[r];
            if(rule instanceof CSSFontFaceRule){
              const ffam=rule.style.getPropertyValue('font-family').replace(/['"]/g,'').trim();
              if(result.families.has(ffam)) result.fontFaces.push(rule.cssText);
            }
          }
        }catch(e){}
      }
    }catch(e){}
    return result;
  }

  function collectCssVars(matchedRules){
    const used=new Set();
    const varRegex=/var\(\s*(--[A-Za-z0-9-_]+)\s*(?:,[^)]+)?\)/g;
    for(const rule of matchedRules||[]){ let m; const cssText=rule.cssText||''; while((m=varRegex.exec(cssText))!==null) used.add(m[1]); }
    const rootVars={};
    try{
      for(let i=0;i<document.styleSheets.length;i++){
        try{
          const sheet=document.styleSheets[i];
          const rules=sheet.cssRules||sheet.rules; if(!rules) continue;
          for(let r=0;r<rules.length;r++){
            const rule=rules[r]; if(!rule.selectorText) continue;
            if(rule.selectorText.includes(':root')||rule.selectorText==='html'){
              const style=rule.style; for(let s=0;s<style.length;s++){ const name=style[s]; if(name.startsWith('--')&&used.has(name)) rootVars[name]=style.getPropertyValue(name).trim(); }
            }
            if(rule.selectorText.includes('[data-theme]')){
              const style=rule.style; for(let s=0;s<style.length;s++){ const name=style[s]; if(name.startsWith('--')&&used.has(name)) rootVars[name]=style.getPropertyValue(name).trim(); }
            }
          }
        }catch(e){}
      }
    }catch(e){}
    return {used:Array.from(used), root:rootVars};
  }

  function extractStates(element){
    const states={};
    const pseudo=[':hover',':focus',':focus-visible',':active',':visited','::before','::after'];
    try{
      const sheets=Array.from(document.styleSheets);
      for(const sheet of sheets){
        try{
          const rules=sheet.cssRules||sheet.rules; if(!rules) continue;
          for(let i=0;i<rules.length;i++){
            const rule=rules[i]; if(!(rule instanceof CSSStyleRule)) continue;
            const sel=rule.selectorText; if(!sel) continue;
            for(const p of pseudo){ if(sel.includes(p)){ if(matchesPseudo(sel,element)){ if(!states[p]) states[p]=[]; states[p].push({selector:sel, cssText:rule.style.cssText}); } } }
          }
        }catch(e){}
      }
    }catch(e){}
    return states;
  }

  function matchesPseudo(selector,element){
    const tag=element.tagName.toLowerCase();
    if(selector.includes(tag)) return true;
    if(element.id && selector.includes('#'+element.id)) return true;
    for(let i=0;i<element.classList.length;i++){ const c=element.classList[i]; try{ if(selector.includes('.'+CSS.escape(c))) return true; }catch(e){ if(selector.includes('.'+c)) return true; } }
    return false;
  }

  window.CBV_buildBundle = function(element){
    if(!(element instanceof Element)) throw new Error('Invalid element');
    const matched=getMatchedCssRules(element);
    const vars=collectCssVars(matched);
    const fonts=detectFontsAndIcons(element);
    const states=extractStates(element);
    let cssLines=[];
    if(vars.root && Object.keys(vars.root).length){ cssLines.push(':root {'); for(const k in vars.root){ cssLines.push('  '+k+': '+vars.root[k]+';'); } cssLines.push('}'); cssLines.push(''); }
    for(const rule of matched){ const cleaned=cleanCssText(rule.cssText); if(cleaned){ cssLines.push(rule.selector+' {'); cleaned.split(';').forEach(c=>{if(c.trim()) cssLines.push('  '+c.trim()+';');}); cssLines.push('}'); cssLines.push(''); } }
    if(states){ for(const p in states){ const list=states[p]; if(!list) continue; list.forEach(s=>{ const cleaned=cleanCssText(s.cssText); if(cleaned){ cssLines.push(s.selector+' {'); cleaned.split(';').forEach(c=>{if(c.trim()) cssLines.push('  '+c.trim()+';');}); cssLines.push('}'); cssLines.push(''); } }); } }
    const cssBundle=cssLines.join('\n');
    return {
      id:'cbv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      name:(element.tagName.toLowerCase())+(element.id?'#'+element.id:'')+(element.classList&&element.classList[0]?'.'+element.classList[0]:''),
      createdAt:Date.now(),
      html:element.outerHTML,
      css:cssBundle,
      assets:{cssVars:vars.root||{}, usedVars:vars.used||[], fonts:fonts.fontFaces||[], fontFamilies:Array.from(fonts.families||[]), icons:fonts.icons||{type:'none',family:null,cdn:[]}, links:fonts.links||[], svgs:fonts.svgs||[]},
      meta:{tag:element.tagName.toLowerCase(), id:element.id||null, classes:element.classList?Array.from(element.classList):[], selectorHint:''}
    };
  };
})();

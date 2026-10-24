(() => {
  document.querySelector('#oms-math-bootstrap')?.remove();
  // All SVG glyph tables are bundled; lazy ranges must not reload them for missing glyphs.
  for(const font of Object.values(window.MathJax.OutputJax.SVG.FONTDATA.FONTS))if(font && typeof font==='object')delete font.Ranges;
  const selector='.markdown-body:not(textarea)';
  const mathSelector='.MathJax_SVG,.MathJax_SVG_Display,.MathJax_SVG_test,.MathJax_Error,.MathJax_Preview,.MJX_Assistive_MathML,[id^="MathJax-"]';
  const pending=new Set();
  let timer,working=false;
  function schedule(node) {
    const element=node.nodeType===1?node:node.parentElement;
    if(!element || element.closest(mathSelector) || element.closest('[data-oms-ui]')) return;
    const body=element.closest(selector);
    if(body)pending.add(body);
    element.querySelectorAll(selector).forEach(body=>pending.add(body));
    if(pending.size && !timer && !working)timer=setTimeout(flush,50);
  }
  function flush() {
    timer=null;
    const bodies=[...pending].filter(node=>node.isConnected);pending.clear();
    if(!bodies.length)return;
    working=true;
    const math=window.MathJax;
    math.Hub.Queue(...bodies.map(body=>['Typeset',math.Hub,body]),()=>{
      working=false;
      if(pending.size && !timer)timer=setTimeout(flush,50);
    });
  }
  const observer=new MutationObserver(records=>{
    for(const record of records) {
      const nodes=[...record.addedNodes,...record.removedNodes];
      if(nodes.length && nodes.every(node=>node.nodeType===1 && (node.matches(mathSelector) || node.closest('[data-oms-ui]'))))continue;
      schedule(record.target);
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  document.querySelectorAll(selector).forEach(schedule);
})();

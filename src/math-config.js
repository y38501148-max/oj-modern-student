// Use the same bundled TeX glyphs on every machine, without depending on installed STIX fonts.
if (window.MathJax?.Hub?.getAllJax) for (const jax of window.MathJax.Hub.getAllJax()) jax.Remove();
// MathJax 2 discovers its root from script elements. Avoid reusing the site's HTML-CSS config query.
const mathMarker=document.createElement('script');
mathMarker.id='oms-math-bootstrap';mathMarker.type='application/x-oms-mathjax';
mathMarker.src=location.origin+'/bower_components/MathJax/MathJax.js';document.body.append(mathMarker);
window.MathJax = {
  root: location.origin + '/bower_components/MathJax',
  skipStartupTypeset: true, showMathMenu: false, messageStyle: 'none',
  jax: ['input/TeX','output/SVG'], extensions: [],
  menuSettings: {renderer:'SVG',locale:'en'},
  tex2jax: {inlineMath:[['$','$'],['\\(','\\)']],displayMath:[['$$','$$'],['\\[','\\]']],processEscapes:true},
  SVG: {font:'TeX',scale:100,matchFontHeight:false,useGlobalCache:false,blacker:0},
};

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
async function loadMath() {
  const dom=new JSDOM('<!doctype html><html><head></head><body></body></html>',{url:'https://accoding.buaa.edu.cn/',runScripts:'outside-only',pretendToBeVisual:true});
  Object.defineProperty(dom.window.navigator,'userAgent',{value:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'});
  Object.defineProperty(dom.window.navigator,'appVersion',{value:'5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'});
  dom.window.MathJax={skipStartupTypeset:true,showMathMenu:false,jax:['input/TeX','output/SVG'],extensions:[]};
  dom.window.eval(await readFile(new URL('../vendor/mathjax2/mathjax-svg.js',import.meta.url),'utf8'));
  return dom;
}
test('打包的 TeX 字体保留基础拉丁字形，直立字母不会被字体元数据覆盖',async()=>{
  const dom=await loadMath();
  try {
    const fonts=dom.window.MathJax.OutputJax.SVG.FONTDATA.FONTS;
    for(const font of ['MathJax_Main','MathJax_Main-bold','MathJax_Main-italic'])for(let code=65;code<=90;code++)assert.equal(Array.isArray(fonts[font][code]),true,`${font}: ${String.fromCharCode(code)}`);
    assert.equal(typeof dom.window.MathJax.Hub.Queue,'function');
  } finally { dom.window.close(); }
});
test('全角标点和中文使用缺字回退，不重复加载已打包字表或抛出字体查找异常',async()=>{
  const dom=await loadMath();
  try {
    dom.window.eval(await readFile(new URL('../src/math-layout.js',import.meta.url),'utf8'));
    const svg=dom.window.MathJax.OutputJax.SVG;
    svg.loadFont=()=>{throw Error('不应重新请求已打包字表');};
    for(const character of ['，','中','。'])assert.equal(svg.lookupChar({fonts:['MathJax_Main']},character.codePointAt(0)).id,'unknown');
    assert.equal(svg.lookupChar({fonts:['MathJax_Main']},65),svg.FONTDATA.FONTS.MathJax_Main);
  } finally { dom.window.close(); }
});

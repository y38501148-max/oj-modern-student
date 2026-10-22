import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
test('打包的 TeX 字体保留基础拉丁字形，直立字母不会被字体元数据覆盖',async()=>{
  const dom=new JSDOM('<!doctype html><html><head></head><body></body></html>',{url:'https://accoding.buaa.edu.cn/',runScripts:'outside-only',pretendToBeVisual:true});
  try {
    Object.defineProperty(dom.window.navigator,'userAgent',{value:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'});
    Object.defineProperty(dom.window.navigator,'appVersion',{value:'5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'});
    dom.window.MathJax={skipStartupTypeset:true,showMathMenu:false,jax:['input/TeX','output/SVG'],extensions:[]};
    dom.window.eval(await readFile(new URL('../vendor/mathjax2/mathjax-svg.js',import.meta.url),'utf8'));
    const fonts=dom.window.MathJax.OutputJax.SVG.FONTDATA.FONTS;
    for(const font of ['MathJax_Main','MathJax_Main-bold','MathJax_Main-italic'])for(let code=65;code<=90;code++)assert.equal(Array.isArray(fonts[font][code]),true,`${font}: ${String.fromCharCode(code)}`);
    assert.equal(typeof dom.window.MathJax.Hub.Queue,'function');
  } finally { dom.window.close(); }
});

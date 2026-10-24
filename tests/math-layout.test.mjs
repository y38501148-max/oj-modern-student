import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const source=await readFile(new URL('../src/math-layout.js',import.meta.url),'utf8');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function page(queue) {
  const dom=new JSDOM('<body><div class="markdown-body"><p>$x$</p></div></body>',{runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.MathJax={OutputJax:{SVG:{FONTDATA:{FONTS:{}}}},Hub:{Queue:queue}};
  dom.window.eval(source);
  return dom;
}
test('公式错误与测量节点不会再次触发排版，避免错误公式持续闪动',async()=>{
  let calls=0;
  const dom=page((...items)=>{
    calls++;
    const body=items[0][2],paragraph=body.querySelector('p');
    paragraph.querySelector('.MathJax_Error')?.remove();
    const measure=body.ownerDocument.createElement('span');measure.className='MathJax_SVG_test';paragraph.append(measure);measure.remove();
    const error=body.ownerDocument.createElement('span');error.className='MathJax_Error';error.textContent='[Math Processing Error]';paragraph.append(error);
    items.at(-1)();
  });
  try {await pause(240);assert.equal(calls,1);assert.equal(dom.window.document.querySelectorAll('.MathJax_Error').length,1);}
  finally {dom.window.close();}
});
test('排版途中切题会处理新题面，复制按钮不触发额外排版',async()=>{
  const callbacks=[],bodies=[];
  const dom=page((...items)=>{bodies.push(items[0][2]);callbacks.push(items.at(-1));});
  try {
    await pause(80);assert.equal(callbacks.length,1);
    const body=dom.window.document.querySelector('.markdown-body');body.innerHTML='<p>$y^2$</p>';
    await pause(0);callbacks[0]();await pause(80);assert.equal(callbacks.length,2);assert.equal(bodies[1],body);
    callbacks[1]();
    const control=dom.window.document.createElement('span');control.dataset.omsUi='';control.textContent='复制';body.append(control);
    await pause(80);assert.equal(callbacks.length,2);
  } finally {dom.window.close();}
});

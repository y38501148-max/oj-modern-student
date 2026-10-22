import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const channel = process.argv.includes('--edge') ? 'edge' : 'github';
const outArg = process.argv.indexOf('--out');
const out = outArg >= 0 ? resolve(process.argv[outArg + 1]) : resolve(root, 'extension');
const { version } = JSON.parse(await readFile(resolve(root, 'package.json')));
if (!/^\d+\.\d+\.\d+$/.test(version)) throw Error('版本号须为 x.y.z');
await mkdir(out, { recursive: true });
const manifest = {
  manifest_version: 3, name: 'OJ Modern Student', version,
  description: '北航 Accoding 学生端：界面美化、文本与代码复制、提交界面优化。',
  homepage_url: 'https://github.com/y38501148-max/oj-modern-student',
  permissions: ['storage','alarms','clipboardWrite'],
  host_permissions: ['https://raw.githubusercontent.com/*'],
  background: { service_worker: 'background.js', type: 'module' },
  action: { default_title: '检查更新 · OJ Modern Student', default_popup: 'popup.html', default_icon: { 16: 'icons/16.png', 32: 'icons/32.png' } },
  icons: { 16: 'icons/16.png', 32: 'icons/32.png', 48: 'icons/48.png', 128: 'icons/128.png' },
  content_scripts: [
    {matches:['https://accoding.buaa.edu.cn/problem/*','https://accoding.buaa.edu.cn/contest-ng/*'],js:['math-config.js','mathjax-svg.js','math-layout.js'],world:'MAIN',run_at:'document_idle'},
    {matches:['https://accoding.buaa.edu.cn/*'],css:['theme.css'],js:['content.js'],run_at:'document_idle'},
  ],
  content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" }
};
await writeFile(resolve(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(resolve(out, 'config.js'), `export const CHANNEL = '${channel}';\n`);
for (const entry of ['content','popup']) {
  await build({
    configFile:false, plugins:[vue()], logLevel:'warn',
    define:{'process.env.NODE_ENV':JSON.stringify('production'),__VUE_OPTIONS_API__:true,__VUE_PROD_DEVTOOLS__:false,__VUE_PROD_HYDRATION_MISMATCH_DETAILS__:false},
    build:{
      outDir:out,emptyOutDir:false,cssCodeSplit:false,
      lib:{entry:resolve(root,`src/${entry}.ts`),name:'OJModernStudent',formats:['iife'],fileName:()=>`${entry}.js`,cssFileName:entry==='content'?'theme':'popup'},
    },
  });
}
for (const name of ['core.mjs','background.js','popup.html']) await copyFile(resolve(root, 'src', name), resolve(out, name));
for (const name of ['math-config.js','math-layout.js']) await copyFile(resolve(root,'src',name),resolve(out,name));
await copyFile(resolve(root,'vendor/mathjax2/mathjax-svg.js'),resolve(out,'mathjax-svg.js'));
await copyFile(resolve(root,'vendor/mathjax2/LICENSE'),resolve(out,'MathJax-LICENSE'));
await copyFile(resolve(root, 'LICENSE'), resolve(out, 'LICENSE'));

await mkdir(resolve(out, 'icons'), { recursive:true });
for (const size of [16,32,48,128]) await copyFile(resolve(root, `src/icons/${size}.png`), resolve(out, `icons/${size}.png`));
// Version metadata is public data, never executable update code.
if (out === resolve(root, 'extension')) await writeFile(resolve(root, 'version.json'), JSON.stringify({ version }, null, 2) + '\n');
console.log(`Built ${channel} v${version}: ${out}`);

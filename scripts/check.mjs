import { readFile, readdir, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const manifest = JSON.parse(await readFile(new URL('../extension/manifest.json',import.meta.url)));
for (const file of await readdir(new URL('../src/',import.meta.url))) if (/\.(js|mjs)$/.test(file) && file !== 'content.js') execFileSync(process.execPath,['--check','src/'+file],{stdio:'inherit'});
execFileSync(process.execPath,['--check','extension/content.js'],{stdio:'inherit'});
const files = [...manifest.content_scripts.flatMap(s=>[...s.js,...s.css]),manifest.background.service_worker,manifest.action.default_popup,...Object.values(manifest.icons)];
for (const file of files) await access(new URL('../extension/'+file,import.meta.url));
if (manifest.manifest_version !== 3) throw Error('Expected MV3');
console.log('Manifest assets and JavaScript syntax passed.');

import { mkdir, readFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = new URL('../', import.meta.url).pathname;
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
await mkdir(resolve(root,'dist'), { recursive:true });
for (const channel of ['github','edge']) {
  const out = resolve(root, `dist/${channel}`);
  await rm(out,{ recursive:true, force:true });
  execFileSync(process.execPath, ['scripts/build.mjs', ...(channel === 'edge' ? ['--edge'] : []), '--out', out], { cwd:root, stdio:'inherit' });
  const archive = resolve(root, `dist/oj-modern-student-${channel}-${version}.zip`);
  await rm(archive, { force:true });
  execFileSync('zip',['-qr',archive,'.'], { cwd:out });
  console.log(archive);
}

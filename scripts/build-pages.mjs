import {mkdir,copyFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const output=new URL('_site/',root);
await mkdir(new URL('lib/',output),{recursive:true});
// An explicit allowlist prevents .env, Qloo adapters and captured live data reaching Pages.
for(const file of ['index.html','app.js','input-tools.js','static-api.js','styles.css','icon.svg'])
  await copyFile(new URL(`public/${file}`,root),new URL(file,output));
for(const file of ['domain.mjs','example.mjs','public-case.mjs'])
  await copyFile(new URL(`lib/${file}`,root),new URL(`lib/${file}`,output));
await writeFile(new URL('runtime-config.js',output),'export const staticHosting = true;\n');
await writeFile(new URL('.nojekyll',output),'');
console.log('Built static desk in _site. Live Qloo is disabled; no environment files were loaded.');

import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const output=new URL('_site/',root);
await mkdir(new URL('lib/',output),{recursive:true});
// Explicit allowlist: never load .env or copy the adapter/captured live data.
const sources=new Map();
for(const file of ['index.html','app.js','input-tools.js','static-api.js','styles.css','icon.svg'])
  sources.set(file,await readFile(new URL(`public/${file}`,root),'utf8'));
for(const file of ['domain.mjs','example.mjs','public-case.mjs','assessment.mjs','report.mjs'])
  sources.set(`lib/${file}`,await readFile(new URL(`lib/${file}`,root),'utf8'));
sources.set('runtime-config.js','export const staticHosting = true;\n');
// Version the complete module graph, not just the entry script: Pages caches assets.
const version=createHash('sha256').update([...sources.values()].join('\n')).digest('hex').slice(0,12);
for(const [file,content]of sources){
  const versioned=content.replace(/(["'])(\.\.?\/[^"']+\.(?:m?js|css|svg))\1/g,(_,quote,path)=>`${quote}${path}?v=${version}${quote}`);
  await writeFile(new URL(file,output),versioned);
}
await writeFile(new URL('.nojekyll',output),'');
console.log(`Built static desk ${version} in _site. Live Qloo disabled; no environment files loaded.`);

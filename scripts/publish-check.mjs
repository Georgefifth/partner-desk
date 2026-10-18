import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {realpathSync} from 'node:fs';
const root=realpathSync(new URL('../',import.meta.url));
const top=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8'}).trim();
if(top!==root)throw new Error('Refusing to inspect or publish an inherited repository.');
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const issues=[];
const tokenPattern=/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
const privateKey=process.env.QLOO_API_KEY;
for(const file of new Set(files)){
  if((file.startsWith('.env')&&file!=='.env.example')||/^(artifacts|node_modules|_site)\//.test(file)){issues.push(`${file}: excluded material`);continue;}
  const data=await readFile(new URL('../'+file,import.meta.url),'utf8');
  if(tokenPattern.test(data)||(privateKey?.length>8&&data.includes(privateKey)))issues.push(`${file}: credential detected`);
}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}
else console.log(`Publish preflight passed: ${new Set(files).size} project files; no configured Qloo key or recognized credentials; excluded data absent. Manual source review still required.`);

import {compareCampaign,exportMarkdown} from './lib/domain.mjs';
import {example} from './lib/example.mjs';
import {publicCase} from './lib/public-case.mjs';

export async function staticApi(path,options={}) {
  if(path==='/api/config')return {liveAvailable:false,tokenRequired:false,staticHosting:true,version:'0.3.0'};
  if(path==='/api/example')return structuredClone(example);
  if(path==='/api/public-case')return {...structuredClone(publicCase),mode:'commercial'};
  const body=options.body?JSON.parse(options.body):{};
  if(path==='/api/analyze'||path==='/api/export') {
    const campaign=path==='/api/export'?body.campaign:body;
    if(campaign.mode==='live')throw new Error('Live Qloo needs the Node server. Choose Commercial checks to review terms here; no evidence will be invented.');
    const report=await compareCampaign(campaign);
    return path==='/api/export'?{markdown:exportMarkdown(report,body.pinnedIds??[])}:report;
  }
  throw new Error('Live Qloo is unavailable on this static site. Run the server edition for live evidence.');
}

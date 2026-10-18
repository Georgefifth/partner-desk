import readline from 'node:readline';
import { compareCampaign, exportMarkdown } from './lib/domain.mjs';
import { QlooClient } from './lib/qloo.mjs';

const qloo = process.env.QLOO_API_KEY ? new QlooClient({ apiKey: process.env.QLOO_API_KEY, baseUrl: process.env.QLOO_BASE_URL }) : null;
const tools = [
  { name: 'search_partner_entity', description: 'Search Qloo for brand, artist or podcast identities. Ask the user to confirm a result before using it in a campaign.', inputSchema: { type:'object', properties:{ query:{type:'string'},type:{type:'string',enum:['brand','artist','podcast']} },required:['query','type'] } },
  { name: 'compare_campaign', description: 'Evaluate 1–12 supplied partnership candidates. Hard commercial constraints precede Qloo affinity. Live mode requires user-confirmed entity IDs; missing evidence stays unknown. Confirm quoteBasis and quoteChannel; per-unit rates need quoteUnits and CPM remains non-comparable. This tool never sends outreach or predicts ROI. All monetary amounts are in campaign currency.', inputSchema:{ type:'object', properties:{ mode:{type:'string',enum:['demo','live','commercial']},title:{type:'string'},brand:{type:'string'},objective:{type:'string'},market:{type:'string'},format:{type:'string'},currency:{type:'string',enum:['USD','GBP','EUR','MYR']},budget:{type:'number'},brandEntity:{type:'object',properties:{entity_id:{type:'string'},subtype:{type:'string'},confirmed:{type:'boolean'}}},candidates:{type:'array',minItems:1,maxItems:12,items:{type:'object',properties:{id:{type:'string'},name:{type:'string'},type:{type:'string',enum:['artist','podcast']},fee:{type:['number','null']},quoteBasis:{type:'string',enum:['package','episode','week','cpm','unknown']},quoteUnits:{type:['integer','null'],minimum:1,maximum:10000},quoteChannel:{type:'string',enum:['artist','podcast','website','newsletter','unknown']},markets:{type:'array',items:{type:'string'}},format:{type:'string'},notes:{type:'string'},source:{type:'string'},excluded:{type:'boolean'},entity:{type:'object',properties:{entity_id:{type:'string'},subtype:{type:'string'},confirmed:{type:'boolean'}}}},required:['id','name','type']}}},required:['mode','title','brand','market','format','currency','budget','candidates'] } }
];
async function handle(message) {
  if (message.id === undefined) return;
  const reply = result => process.stdout.write(`${JSON.stringify({jsonrpc:'2.0',id:message.id,result})}\n`);
  if (message.method === 'initialize') return reply({ protocolVersion:'2024-11-05', capabilities:{tools:{}},serverInfo:{name:'partner-desk',version:'0.4.0'} });
  if (message.method === 'ping') return reply({});
  if (message.method === 'tools/list') return reply({tools});
  if (message.method === 'tools/call') {
    try {
      let result;
      if (message.params.name === 'search_partner_entity') {
        if (!qloo) throw new Error('Live Qloo access is not configured.');
        result = await qloo.search(message.params.arguments.query,message.params.arguments.type);
      } else if (message.params.name === 'compare_campaign') {
        const report = await compareCampaign(message.params.arguments,qloo);
        result = {report,markdown:exportMarkdown(report)};
      } else throw new Error('Unknown tool.');
      return reply({content:[{type:'text',text:JSON.stringify(result)}]});
    } catch (error) { return reply({isError:true,content:[{type:'text',text:error.message}]}); }
  }
  process.stdout.write(`${JSON.stringify({jsonrpc:'2.0',id:message.id,error:{code:-32601,message:'Method not found'}})}\n`);
}
const input = readline.createInterface({input:process.stdin,crlfDelay:Infinity});
let queue = Promise.resolve();
input.on('line',line => {
  if (Buffer.byteLength(line) > 65536) return process.stdout.write(`${JSON.stringify({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Request too large'}})}\n`);
  let message; try { message=JSON.parse(line); } catch { return process.stdout.write(`${JSON.stringify({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}})}\n`); }
  queue = queue.then(() => handle(message)).catch(() => process.stdout.write(`${JSON.stringify({jsonrpc:'2.0',id:message.id ?? null,error:{code:-32603,message:'Request failed'}})}\n`));
});

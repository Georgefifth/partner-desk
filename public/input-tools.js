export const basisLabels={package:'Whole package',episode:'Per episode',week:'Per week',cpm:'Per 1,000 impressions',unknown:'Not confirmed'};
export const channelLabels={artist:'Artist collaboration',podcast:'Podcast',website:'Website',newsletter:'Newsletter',unknown:'Not confirmed'};

export function parseCandidateLines(text,defaultType='podcast',existing=[]) {
  if(!['podcast','artist'].includes(defaultType))throw new Error('Choose artist or podcast.');
  const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(!lines.length)throw new Error('Paste at least one name.');
  if(existing.length+lines.length>12)throw new Error('Keep the full list to 12 candidates or fewer.');
  const key=(name,type)=>`${type}:${name.toLowerCase().replace(/\s+/g,' ').trim()}`;
  const seen=new Set(existing.map(c=>key(c.name,c.type)));
  return lines.map((line,index)=>{
    const parts=line.split('|').map(x=>x.trim());
    if(parts.length>2)throw new Error(`Line ${index+1}: use a name, optionally followed by | artist or | podcast.`);
    const [name,type=defaultType]=parts;
    if(!name||name.length>100||!['artist','podcast'].includes(type))throw new Error(`Line ${index+1}: add a name and use artist or podcast as the category.`);
    if(seen.has(key(name,type)))throw new Error(`Duplicate candidate: ${name}.`);
    seen.add(key(name,type));
    return {name,type,fee:null,quoteBasis:'unknown',quoteUnits:null,quoteChannel:'unknown',markets:[],format:'',notes:'',source:'',excluded:false};
  });
}

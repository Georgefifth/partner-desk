// A small, declared sample. This is a coverage probe, not a market estimate.
const base=process.env.APP_URL||'http://127.0.0.1:4318';
const headers=process.env.ACCESS_TOKEN?{Authorization:`Bearer ${process.env.ACCESS_TOKEN}`}:{ };
const sample={brand:['Fellow','Owala','Topo Designs','Passenger','Field Notes','Tom Bihn','Peak Design','Patagonia'],podcast:['The Pen Addict','Accidental Tech Podcast','Outside Podcast','The Adventure Podcast']};
const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const rows=[];
for(const [type,names] of Object.entries(sample))for(const name of names){
 const response=await fetch(`${base}/api/search?query=${encodeURIComponent(name)}&type=${type}`,{headers});const data=await response.json();
 const exact=data.entities?.filter(e=>normalize(e.name)===normalize(name))??[];
 rows.push({name,type,exactMatches:exact.length,returnedChoices:data.entities?.length??0,...(!response.ok?{error:data.error}:{})});
}
console.log(JSON.stringify({sample:'Convenience sample of 8 brands and 4 podcasts; not representative.',rows},null,2));

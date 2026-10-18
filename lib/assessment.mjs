export function quoteCost(c){
  if(c.fee===null)return {amount:null,detail:'Request a quote.'};
  if(c.quoteBasis==='unknown')return {amount:null,detail:'Confirm whether this is a package, weekly, episode or CPM rate.'};
  if(c.quoteBasis==='cpm')return {amount:null,detail:'A CPM rate is not a package cost. Request a package quote or a delivery estimate before comparing budget.'};
  const unit=c.quoteBasis==='episode'?'episodes':'weeks';
  if(c.quoteBasis!=='package'&&c.quoteUnits===null)return {amount:null,detail:`Confirm how many ${unit} the campaign will buy.`};
  const quantity=c.quoteBasis==='package'?1:c.quoteUnits;
  return {amount:Math.round(c.fee*100)*quantity/100,detail:c.quoteBasis==='package'?'Whole-package quote.':`${c.fee} × ${quantity} ${unit}; calculated from your supplied rate.`};
}


export const commercialLabels={'worth-a-conversation':'Terms fit','needs-information':'Confirm terms','does-not-fit':'Does not fit'};
export function commercialAssessment(row){
  const failed=row.checks.filter(check=>check.state==='fail');
  const missing=row.checks.filter(check=>check.state==='unknown');
  return {decision:failed.length?'does-not-fit':missing.length?'needs-information':'worth-a-conversation',reason:failed.length?failed.map(check=>check.detail).join(' '):missing.length?missing.map(check=>check.detail).join(' '):'Supplied commercial terms fit this brief. This does not establish cultural fit or availability.'};
}

export function compareCommercialRows(a,b){
  const order={'worth-a-conversation':0,'needs-information':1,'does-not-fit':2};
  return order[commercialAssessment(a).decision]-order[commercialAssessment(b).decision]||a.type.localeCompare(b.type)||a.name.localeCompare(b.name);
}

// Shared transport errors never expose a hosting provider's HTML response.
// No automatic retries: an interrupted live request may already have spent quota.
export async function requestJson(path,options={}, {fetcher=fetch,timeoutMs=90000}={}) {
  const timeout=new AbortController();
  const timer=setTimeout(()=>timeout.abort(),timeoutMs);
  const signal=options.signal?AbortSignal.any([options.signal,timeout.signal]):timeout.signal;
  try {
    const response=await fetcher(path,{...options,signal});
    let data;
    try{data=await response.json();}
    catch(error){
      if(signal.aborted)throw error;
      throw new Error('The server did not return a usable response. It may be waking up. Wait a moment, then try again; your brief is unchanged.');
    }
    if(!response.ok){const error=new Error(typeof data?.error==='string'?data.error:'This request could not be completed. Try again.');error.status=response.status;throw error;}
    return data;
  } catch(error) {
    if(options.signal?.aborted)throw error;
    if(timeout.signal.aborted)throw new Error('The server took too long to respond. Your brief is unchanged. Wait a moment, then try again.');
    if(error instanceof TypeError)throw new Error('Could not reach the server. Check your connection, then try again; your brief is unchanged.');
    throw error;
  } finally{clearTimeout(timer);}
}

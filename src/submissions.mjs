const histories = new WeakMap();
export function formatScore(value) {
  return value === null || value === undefined ? '—' : String(Math.round(Number(value)*10000)/100);
}

export function enhanceSubmissionHistory(document, href, renderScore, fetcher = (url,options)=>globalThis.fetch(url,options)) {
  const contest = new URL(href).hash.match(/^#\/(\d+)\/problems(?:$|[/?])/);
  if (!contest) return;
  for (const table of document.querySelectorAll('[ng-view] table.table')) {
    const header = table.tHead?.rows[0];
    if (!header || [...header.cells].map(cell=>cell.textContent.trim()).join('|') !== 'ID|结果|时间|内存' && !table.classList.contains('oms-submission-table')) continue;
    table.classList.add('oms-submission-table');
    table.closest('[ng-view]>div')?.classList.add('oms-submission-aside');
    if (!header.querySelector('.oms-score-cell')) {
      const cell = document.createElement('th'); cell.className='oms-score-cell'; cell.scope='col'; cell.textContent='分数'; cell.title='百分制'; header.cells[1].after(cell);
      header.cells[3].textContent='时间 ms'; header.cells[4].textContent='内存 KB';
    }
    const rows = [...(table.tBodies[0]?.rows || [])].map(row=>{
      const id = row.querySelector('a[href*="/submission/"]')?.textContent.trim();
      if (!id) return null;
      if (!row.querySelector('.oms-score-cell')) {
        const cell = document.createElement('td'); cell.className='oms-score-cell'; cell.dataset.omsUi=''; cell.textContent='…'; row.cells[1].after(cell);
      }
      return {id,row};
    }).filter(Boolean);
    const signature = contest[1] + ':' + rows.map(({id,row})=>id+':'+[...row.cells].filter(cell=>!cell.classList.contains('oms-score-cell')).map(cell=>cell.textContent.trim()).join(',')).join('|');
    let state = histories.get(table);
    if (!state) { state={signature:'',loading:false}; histories.set(table,state); }
    if (!rows.length || state.loading || signature===state.signature) continue;
    state.signature=signature; state.loading=true;
    void (async()=>{
      try {
        const response = await fetcher(`/api/contests/${contest[1]}/submissions`, {credentials:'same-origin'});
        if (!response.ok) throw Error('分数读取失败');
        const submissions = new Map((await response.json()).map(submission=>[String(submission.id),submission]));
        for (const {id,row} of rows) {
          if (!row.isConnected) continue;
          renderScore(row.querySelector('.oms-score-cell'),submissions.get(id) || {score:null});
        }
      } catch {
        for (const {row} of rows)if(row.isConnected)renderScore(row.querySelector('.oms-score-cell'),{score:null,error:'分数读取失败，刷新页面重试'});
      } finally { state.loading=false; enhanceSubmissionHistory(document,document.location.href,renderScore,fetcher); }
    })();
  }
}

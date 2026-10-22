const verdicts = {'Accepted':'AC','Wrong Answer':'WA','Compile Error':'CE','Time Limit Exceed':'TLE','Memory Limit Exceed':'MLE','Presentation Error':'PE','Runtime Error (SIGSEGV)':'REG','Runtime Error (SIGFPE)':'REP','Waiting':'WT','Running':'JG','Other Error':'OE','Judge Error':'ERR'};

export function parsePersonalHistory(document, userId) {
  if (!document.querySelector('#form_of_submission')) throw Error('无法读取提交记录，请重新登录后重试。');
  const rows = [...document.querySelectorAll('tr[id^="tr"]')].filter(row=>row.querySelector(`a[href="/user/${userId}/index"]`)).map(row=>{
    const cell=row.querySelector('[id^="submission_id"]');
    const id=cell?.querySelector('a[href*="/submission/"]')?.getAttribute('href').match(/\/submission\/(\d+)/)?.[1] || cell?.textContent.trim();
    const result=row.querySelector('[id^="submission_result"]')?.textContent.trim();
    return {id,result:verdicts[result] || result,score:row.querySelector('[id^="submission_score"]')?.textContent.trim() || null,time_cost:row.querySelector('[id^="submission_time"]')?.textContent.trim() || '—',memory_cost:row.querySelector('[id^="submission_memory"]')?.textContent.trim() || '—'};
  }).filter(row=>/^\d+$/.test(row.id));
  const next=[...document.querySelectorAll('[onclick]')].find(node=>node.textContent.trim()==='下一页' && !node.hasAttribute('disabled'));
  return {rows,next:next ? Number(next.getAttribute('onclick').match(/[?&]offset=(\d+)/)?.[1]) || null : null};
}

export async function loadPersonalHistory(problemId, user, csrf, offset=0) {
  const response=await fetch(`/problem/${problemId}/submission?offset=${offset}`,{method:'POST',credentials:'same-origin',body:new URLSearchParams({nickname:user.nickname,result:'',language:'',_csrf:csrf})});
  if(!response.ok) throw Error('提交记录读取失败，请重试。');
  return parsePersonalHistory(new DOMParser().parseFromString(await response.text(),'text/html'),user.id);
}

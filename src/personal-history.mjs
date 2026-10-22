const verdicts = {'Accepted':'AC','Wrong Answer':'WA','Compile Error':'CE','Time Limit Exceed':'TLE','Memory Limit Exceed':'MLE','Presentation Error':'PE','Runtime Error (SIGSEGV)':'REG','Runtime Error (SIGFPE)':'REP','Waiting':'WT','Running':'JG','Other Error':'OE','Judge Error':'ERR'};
let currentUser;
export async function getCurrentUser() {
  if(!currentUser)currentUser=(async()=>{
    const response=await fetch('/api/users/me',{credentials:'same-origin'});
    if(!response.ok)throw Error('请登录后查看个人提交记录。');
    const user=await response.json();if(!user.id)throw Error('请登录后查看个人提交记录。');return user;
  })().catch(error=>{currentUser=null;throw error;});
  return currentUser;
}
export function isPending(row) {return row.result==='WT' || row.result==='JG';}
export async function loadJudgements(ids) {
  if(!ids.length)return [];
  const response=await fetch('/submission/getSubmissionApi?'+new URLSearchParams({submission_id:JSON.stringify(ids)}),{credentials:'same-origin',cache:'no-store'});
  if(!response.ok)throw Error('评测状态更新失败，正在重试。');
  const result=await response.json();
  if(!Array.isArray(result))throw Error('评测状态读取失败，正在重试。');
  return result.filter(row=>ids.includes(String(row.id)));
}

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

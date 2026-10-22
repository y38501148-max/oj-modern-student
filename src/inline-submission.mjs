import { getCurrentUser, parsePersonalHistory } from './personal-history.mjs';
const bound=new WeakSet();

export function bindInlineSubmission(form, history) {
  if(!form || bound.has(form))return;
  const problemId=form.ownerDocument.location.pathname.match(/^\/problem\/(\d+)\/index\/?$/)?.[1];
  const action=new URL(form.action);
  if(!problemId || action.origin!==form.ownerDocument.location.origin || action.pathname!==`/problem/${problemId}/submit`)return;
  const textarea=form.querySelector('textarea[name="code"]');
  const button=form.querySelector('#button,button[type="submit"]');
  if(!textarea || !button)return;
  bound.add(form);button.removeAttribute('onclick');button.type='submit';
  // Page-world onclick can survive attribute removal from a content script.
  button.addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    form.requestSubmit(button);
  },true);
  const status=form.ownerDocument.createElement('p');status.className='oms-submit-status';status.setAttribute('role','status');status.dataset.omsUi='';button.before(status);
  let busy=false;
  form.addEventListener('submit',async event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(busy)return;
    if(!textarea.value.trim()){status.textContent='请输入代码。';textarea.focus();return;}
    if(!form.reportValidity())return;
    busy=true;button.disabled=true;const label=button.textContent;button.textContent='提交中…';status.textContent='';
    let sent=false;
    history.submissionStarted();
    try {
      const user=await getCurrentUser();
      const body=new URLSearchParams();for(const [key,value]of new FormData(form))if(typeof value==='string')body.append(key,value);
      sent=true;
      const response=await fetch(action.href,{method:'POST',body,credentials:'same-origin',mode:'same-origin'});
      const document=new DOMParser().parseFromString(await response.text(),'text/html');
      const url=new URL(response.url);
      if(!response.ok || url.origin!==action.origin || url.pathname!==`/problem/${problemId}/submission` || !document.querySelector('#form_of_submission')) {
        const message=document.querySelector('.alert-danger,.alert-error,.error-message')?.textContent.trim();
        const error=new Error(message || (url.pathname.includes('/login')?'登录已失效，请重新登录。':'提交未成功，请检查代码和语言后重试。'));
        error.rejected=true;throw error;
      }
      const rows=parsePersonalHistory(document,user.id).rows;
      const newest=rows.sort((a,b)=>Number(b.id)-Number(a.id))[0];
      history.submissionCreated(newest);
      status.textContent='已提交，评测结果会显示在右侧。';
      form.closest('.modal')?.querySelector('[data-dismiss="modal"]')?.click();
    } catch(error) {
      history.submissionCancelled();
      if(sent && !error.rejected){status.textContent='提交结果未确认，请先刷新右侧记录后再试。';history.refresh();}
      else status.textContent=error.message;
    } finally {busy=false;button.disabled=false;button.textContent=label;}
  },true);
}

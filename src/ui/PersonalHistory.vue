<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Button, ConfigProvider, Empty, Spin } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { productTheme } from './theme';
import { formatScore } from '../submissions.mjs';
import { getCurrentUser, isPending, loadJudgements, loadPersonalHistory } from '../personal-history.mjs';
const props=defineProps<{problemId:string;csrf:string}>();
const rows=ref<any[]>([]), loading=ref(false), error=ref(''), offsets=ref([0]), next=ref<number|null>(null);
const pollingError=ref('');
let generation=0,timer:ReturnType<typeof setTimeout>|undefined,disposed=false;
function schedulePoll() {
  clearTimeout(timer);
  if(!disposed && rows.value.some(row=>row.id && isPending(row)))timer=setTimeout(poll,3000);
}
async function poll() {
  if(document.hidden){schedulePoll();return;}
  const token=generation, ids=rows.value.filter(row=>row.id && isPending(row)).map(row=>String(row.id));
  if(!ids.length)return;
  try {
    const judgements=await loadJudgements(ids);
    if(disposed || token!==generation)return;
    for(const judgement of judgements){const row=rows.value.find(row=>String(row.id)===String(judgement.id));if(row)Object.assign(row,{result:judgement.result,score:judgement.score,time_cost:judgement.time_cost,memory_cost:judgement.memory_cost});}
    pollingError.value='';
  } catch {if(!disposed && token===generation)pollingError.value='评测状态更新失败，正在重试。';}
  finally {schedulePoll();}
}
async function load(offset=0) {
  const token=++generation;
  loading.value=true;error.value='';
  try {
    const user=await getCurrentUser();
    const page=await loadPersonalHistory(props.problemId,user,props.csrf,offset);
    if(disposed || token!==generation)return;
    rows.value=page.rows;next.value=page.next;pollingError.value='';
  } catch(e:any) { if(!disposed && token===generation)error.value=e.message; } finally {if(token===generation)loading.value=false;schedulePoll();}
}
async function turn(forward:boolean) {
  const previous=[...offsets.value];
  if(forward && next.value!==null)offsets.value.push(next.value);else if(!forward && offsets.value.length>1)offsets.value.pop();
  await load(offsets.value.at(-1));if(error.value)offsets.value=previous;
}
function submissionStarted() {
  generation++;loading.value=false;error.value='';offsets.value=[0];
  rows.value=[{id:null,result:'WT',sending:true},...rows.value.filter(row=>row.id)];
}
function submissionCreated(row:any) {
  generation++;rows.value=[...(row?[row]:[]),...rows.value.filter(item=>item.id && item.id!==row?.id)];
  schedulePoll();void load();
}
function submissionCancelled(){rows.value=rows.value.filter(row=>row.id);schedulePoll();}
function refresh(){offsets.value=[0];void load();}
defineExpose({submissionStarted,submissionCreated,submissionCancelled,refresh});
onMounted(()=>{void load();});
onBeforeUnmount(()=>{disposed=true;generation++;clearTimeout(timer);});
</script>
<template><ConfigProvider prefix-cls="oms-ant" :theme="productTheme"><div class="oms-ui">
  <header class="oms-personal-history-heading"><strong>本题提交记录</strong><Button type="text" size="small" aria-label="刷新提交记录" :loading="loading" @click="load(offsets.at(-1))"><ReloadOutlined /></Button></header>
  <p v-if="error" class="oms-history-status" role="alert">{{ error }}<Button type="link" size="small" @click="load(offsets.at(-1))">重试</Button></p>
  <p v-if="pollingError" class="oms-history-status" role="status">{{ pollingError }}</p>
  <Spin :spinning="loading"><div v-if="rows.length" class="oms-table-wrap"><table class="oms-submission-table"><thead><tr><th>ID</th><th>结果</th><th class="oms-score-cell" title="百分制">分数</th><th>时间 ms</th><th>内存 KB</th></tr></thead><tbody><tr v-for="row in rows" :key="row.id || 'sending'"><td><a v-if="row.id" :href="'/submission/'+row.id" target="_blank" rel="noopener noreferrer">{{ row.id }}</a><span v-else>—</span></td><td :class="isPending(row)?'oms-pending-result':row.result==='AC'?'blue-td':'red-td'"><span v-if="isPending(row)" class="oms-pending-dot" />{{ row.sending?'提交中':row.result==='WT'?'Waiting':row.result==='JG'?'Judging':row.result }}</td><td class="oms-score-cell">{{ isPending(row)?'—':formatScore(row.score) }}</td><td>{{ isPending(row)?'—':row.time_cost }}</td><td>{{ isPending(row)?'—':row.memory_cost }}</td></tr></tbody></table></div><Empty v-else-if="!error && !loading" description="本题暂无提交" :image="Empty.PRESENTED_IMAGE_SIMPLE" /></Spin>
  <nav v-if="next!==null || offsets.length>1" class="oms-history-pagination" aria-label="个人提交记录分页"><Button size="small" :disabled="offsets.length===1 || loading" @click="turn(false)">上一页</Button><span>{{ offsets.length }}</span><Button size="small" :disabled="next===null || loading" @click="turn(true)">下一页</Button></nav>
</div></ConfigProvider></template>

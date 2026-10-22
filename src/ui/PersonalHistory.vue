<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Button, ConfigProvider, Empty, Spin } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { productTheme } from './theme';
import { formatScore } from '../submissions.mjs';
import { loadPersonalHistory } from '../personal-history.mjs';
const props=defineProps<{problemId:string;csrf:string}>();
const rows=ref<any[]>([]), loading=ref(false), error=ref(''), offsets=ref([0]), next=ref<number|null>(null);
let user:any;
async function load(offset=0) {
  loading.value=true;error.value='';
  try {
    if (!user) { const response=await fetch('/api/users/me',{credentials:'same-origin'});if(!response.ok)throw Error('请登录后查看个人提交记录。');user=await response.json();if(!user.id)throw Error('请登录后查看个人提交记录。'); }
    const page=await loadPersonalHistory(props.problemId,user,props.csrf,offset);rows.value=page.rows;next.value=page.next;
  } catch(e:any) { error.value=e.message; } finally { loading.value=false; }
}
async function turn(forward:boolean) {
  const previous=[...offsets.value];
  if(forward && next.value!==null)offsets.value.push(next.value);else if(!forward && offsets.value.length>1)offsets.value.pop();
  await load(offsets.value.at(-1));if(error.value)offsets.value=previous;
}
onMounted(()=>{void load();});
</script>
<template><ConfigProvider prefix-cls="oms-ant" :theme="productTheme"><div class="oms-ui">
  <header class="oms-personal-history-heading"><strong>本题提交记录</strong><Button type="text" size="small" aria-label="刷新提交记录" :loading="loading" @click="load(offsets.at(-1))"><ReloadOutlined /></Button></header>
  <p v-if="error" class="oms-history-status" role="alert">{{ error }}<Button type="link" size="small" @click="load(offsets.at(-1))">重试</Button></p>
  <Spin :spinning="loading"><div v-if="rows.length" class="oms-table-wrap"><table class="oms-submission-table"><thead><tr><th>ID</th><th>结果</th><th class="oms-score-cell" title="百分制">分数</th><th>时间 ms</th><th>内存 KB</th></tr></thead><tbody><tr v-for="row in rows" :key="row.id"><td><a :href="'/submission/'+row.id" target="_blank" rel="noopener noreferrer">{{ row.id }}</a></td><td :class="row.result==='AC'?'blue-td':'red-td'">{{ row.result }}</td><td class="oms-score-cell">{{ formatScore(row.score) }}</td><td>{{ row.time_cost }}</td><td>{{ row.memory_cost }}</td></tr></tbody></table></div><Empty v-else-if="!error && !loading" description="本题暂无提交" :image="Empty.PRESENTED_IMAGE_SIMPLE" /></Spin>
  <nav v-if="next!==null || offsets.length>1" class="oms-history-pagination" aria-label="个人提交记录分页"><Button size="small" :disabled="offsets.length===1 || loading" @click="turn(false)">上一页</Button><span>{{ offsets.length }}</span><Button size="small" :disabled="next===null || loading" @click="turn(true)">下一页</Button></nav>
</div></ConfigProvider></template>

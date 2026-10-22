<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Button, ConfigProvider, Select, Tag } from 'ant-design-vue';
import { ArrowLeftOutlined, CodeOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { productTheme } from './theme';
const props=defineProps<{submission:any;source:HTMLPreElement;copy:(text:string)=>void}>();
const codeHost=ref<HTMLElement>(),fontSize=ref(14);
const lineCount=computed(()=>props.submission.code.replace(/\r?\n$/,'').split(/\r?\n/).length);
const createdAt=computed(()=>{const time=new Date(props.submission.createdAt);return Number.isNaN(time.getTime())?props.submission.createdAt:time.toLocaleString('zh-CN',{hour12:false});});
onMounted(()=>{props.source.classList.add('oms-source-pre');codeHost.value?.append(props.source);});
</script>
<template><ConfigProvider prefix-cls="oms-ant" :theme="productTheme"><div class="oms-ui oms-code-view">
  <header class="oms-code-topbar"><a href="/index"><CodeOutlined />OJ Modern Student</a><a :href="'/problem/'+submission.problemId+'/index'"><ArrowLeftOutlined />返回题目</a></header>
  <main class="oms-code-main">
    <header class="oms-code-heading"><div><h1>提交 #{{ submission.id }}</h1><div class="oms-code-meta"><a :href="'/problem/'+submission.problemId+'/index'">题目 #{{ submission.problemId }}</a><span>{{ submission.author }}</span><time>{{ createdAt }}</time><Tag :color="submission.result==='AC'?'green':submission.result==='WT'||submission.result==='JG'?'gold':'red'">{{ submission.result }}</Tag><span>{{ submission.time }} ms</span><span>{{ submission.memory }} KB</span></div></div></header>
    <section class="oms-code-card" aria-label="提交源码"><header><span>{{ lineCount }} 行 · {{ submission.code.length }} 字符</span><div><Select v-model:value="fontSize" aria-label="代码字号" :options="[13,14,16,18].map(value=>({value,label:value+' px'}))" style="width:90px" /><Button type="primary" @click="copy(submission.code)"><CopyOutlined />复制代码</Button></div></header>
      <div class="oms-code-grid" :style="{'--oms-code-size':fontSize+'px'}"><pre class="oms-source-gutter" aria-hidden="true">{{ Array.from({length:lineCount},(_,index)=>index+1).join('\n') }}</pre><div ref="codeHost" class="oms-code-source" /></div>
    </section>
  </main>
</div></ConfigProvider></template>

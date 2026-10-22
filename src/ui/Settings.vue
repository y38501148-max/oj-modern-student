<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Alert, Button, Card, ConfigProvider, Divider, Switch, Tag } from 'ant-design-vue';
import { ArrowRightOutlined, CodeOutlined, GithubOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { productTheme } from './theme';
import { newerVersion, REPOSITORY } from '../core.mjs';
const state = ref<any>(null);
const settings = reactive({theme:true,copy:true,submission:true});
const checking = ref(false), error = ref(''), saved = ref(false);
const available = computed(()=>state.value && newerVersion(state.value.update?.version || '',state.value.version));
const features = [{key:'theme' as const,label:'界面美化',detail:'导航、首页与题面布局'},{key:'copy' as const,label:'题面与样例复制',detail:'Markdown 和原始样例'},{key:'submission' as const,label:'提交界面优化',detail:'字号、缩进与代码复制'}];
async function load() { const value = await chrome.runtime.sendMessage({type:'state'}); if(value.error)throw Error(value.error);state.value=value;Object.assign(settings,value.settings); }
onMounted(()=>{void load().catch(e=>{error.value=e.message;});});
async function save() { try { const value = await chrome.runtime.sendMessage({type:'settings',settings:{...settings}});if(value.error)throw Error(value.error);saved.value=true; }catch(e:any){error.value=e.message;} }
async function check() {
  checking.value=true;error.value='';
  try {
    const value=await chrome.runtime.sendMessage({type:'check'});if(value.error)throw Error(value.error);state.value=value;
    if(value.channel==='edge')await chrome.runtime.sendMessage({type:'store-check'});
  }catch(e:any){error.value=e.message;}finally{checking.value=false;}
}
</script>
<template><ConfigProvider prefix-cls="oms-ant" :theme="productTheme" :locale="zhCN"><div class="oms-ui oms-settings">
  <header class="oms-settings-heading"><span class="oms-brand-mark"><CodeOutlined /></span><div><h1>OJ Modern Student</h1><span>v{{ state?.version || '…' }}</span></div><Tag color="blue">{{ state?.channel==='edge'?'Edge':'GitHub' }}</Tag></header>
  <Card :bordered="false"><div v-for="feature in features" :key="feature.key" class="oms-feature-setting"><div><label :for="'setting-'+feature.key">{{ feature.label }}</label><small>{{ feature.detail }}</small></div><Switch :id="'setting-'+feature.key" v-model:checked="settings[feature.key]" :aria-label="feature.label" @change="save" /></div><Divider style="margin:14px 0" /><p class="oms-settings-hint" role="status">{{ saved?'已保存，刷新 OJ 页面后生效。':'修改后刷新 OJ 页面生效。' }}</p></Card>
  <Card :bordered="false" class="oms-settings-update"><div class="oms-update-heading"><strong>版本更新</strong><Button type="text" size="small" :loading="checking" @click="check"><template #icon><ReloadOutlined /></template>检查更新</Button></div><p role="status">{{ available?'新版本 '+state.update.version+' 已发布':state?.update?.checkedAt?'当前为最新版本':'正在读取版本…' }}</p><Alert v-if="error || state?.update?.error" :message="error || '版本检查失败，请稍后重试。'" type="warning" show-icon /><a v-if="available" :href="REPOSITORY+'/releases/latest'" target="_blank">下载更新 <ArrowRightOutlined /></a><small>{{ state?.channel==='edge'?'由 Edge 商店自动更新。':'下载新版，替换原目录后在扩展管理页重新加载。' }}</small></Card>
  <Button type="primary" size="large" block href="https://accoding.buaa.edu.cn/" target="_blank">打开 OJ <ArrowRightOutlined /></Button>
  <footer><a :href="REPOSITORY" target="_blank"><GithubOutlined /> GitHub</a><a :href="REPOSITORY+'#安装'" target="_blank">安装说明</a></footer>
</div></ConfigProvider></template>

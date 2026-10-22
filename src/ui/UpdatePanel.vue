<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Alert, Button } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { newerVersion, REPOSITORY } from '../core.mjs';
const state = ref<any>(null), checking = ref(false), error = ref('');
const available = computed(()=>state.value && newerVersion(state.value.update?.version || '',state.value.version));
async function check() {
  checking.value=true;error.value='';
  try {
    state.value=await chrome.runtime.sendMessage({type:'state'});
    const value=await chrome.runtime.sendMessage({type:'check'});
    if(value.error) throw Error(value.error);
    state.value=value;
    if(value.update?.error) throw Error('检查失败，请稍后重试。');
    if(value.channel==='edge') await chrome.runtime.sendMessage({type:'store-check'});
  } catch(e:any) { error.value=e.message; } finally { checking.value=false; }
}
onMounted(()=>{void check();});
</script>
<template>
  <section class="oms-ui oms-update-panel">
    <p>当前版本 <strong>v{{ state?.version || '…' }}</strong></p>
    <p role="status">{{ checking?'正在检查更新…':error?'暂时无法检查更新':available?'发现新版本 v'+state.update.version:'当前为最新版本' }}</p>
    <Alert v-if="error" :message="error" type="warning" show-icon />
    <p v-if="available && !checking" class="oms-update-instructions">{{ state.channel==='edge'?'新版在 Edge 商店上架后自动更新。':'下载新版替换原目录，再到扩展管理页重新加载。' }}</p>
    <div class="oms-update-actions"><Button :loading="checking" @click="check"><ReloadOutlined />重新检查</Button><Button v-if="available && !checking" type="primary" :href="REPOSITORY+'/releases/latest'" target="_blank" rel="noopener noreferrer">下载更新</Button></div>
  </section>
</template>

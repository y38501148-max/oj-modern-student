<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Button, ConfigProvider, Select } from 'ant-design-vue';
import { CopyOutlined } from '@ant-design/icons-vue';
import { productTheme } from './theme';
const props = defineProps<{ textarea: HTMLTextAreaElement; copy: (text: string) => void }>();
const count = ref('');
const size = ref(14);
const update = () => { count.value = `${props.textarea.value.split('\n').length} 行 · ${props.textarea.value.length} 字符`; };
let observer: MutationObserver | undefined;
onMounted(() => {
  update(); props.textarea.addEventListener('input',update);
  const modal = props.textarea.closest('.modal');
  if (modal) { observer = new MutationObserver(update); observer.observe(modal,{attributes:true,attributeFilter:['class']}); }
});
onUnmounted(() => { props.textarea.removeEventListener('input',update); observer?.disconnect(); });
</script>
<template><ConfigProvider prefix-cls="oms-ant" :theme="productTheme"><div class="oms-ui oms-editor-tools"><span class="oms-editor-count" aria-live="polite">{{ count }}</span><Select v-model:value="size" aria-label="代码字号" :options="[14,16,18,20].map(value=>({value,label:value+' px'}))" :get-popup-container="(node: HTMLElement)=>node.parentElement!" @change="textarea.style.fontSize=size+'px'" /><Button @click="copy(textarea.value)"><template #icon><CopyOutlined /></template>复制代码</Button></div></ConfigProvider></template>

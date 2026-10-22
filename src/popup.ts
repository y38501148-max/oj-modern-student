import { createApp } from 'vue';
import { h } from 'vue';
import { ConfigProvider } from 'ant-design-vue';
import UpdatePanel from './ui/UpdatePanel.vue';
import { productTheme } from './ui/theme';
import './ui/interface.css';
createApp({render:()=>h(ConfigProvider,{prefixCls:'oms-ant',theme:productTheme},()=>h('main',{class:'oms-ui oms-popup-updates'},[h('h1','检查更新'),h(UpdatePanel)]))}).mount('#app');

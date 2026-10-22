<script setup lang="ts">
import { computed, ref } from 'vue';
import { Avatar, Badge, Button, Card, Collapse, ConfigProvider, Drawer, Dropdown, Empty, Menu, Modal, Table } from 'ant-design-vue';
import { ArrowRightOutlined, BookOutlined, CodeOutlined, FileTextOutlined, HomeOutlined, MenuOutlined, ReadOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { productTheme } from './theme';
import Courses from './Courses.vue';
import UpdatePanel from './UpdatePanel.vue';

const props = defineProps<{ page: any; version: string }>();
const open = ref(false);
const updatesOpen = ref(false);
function openUpdates() { open.value=false;updatesOpen.value=true; }
const primary = [
  { key: 'home', label: '首页', href: '/index', icon: HomeOutlined },
  { key: 'group', label: '我的课程', href: '/group/index', icon: ReadOutlined },
  { key: 'problem', label: '题库', href: '/problem/index', icon: CodeOutlined },
  { key: 'contest', label: '比赛', href: '/contest/index', icon: BookOutlined },
  { key: 'rank', label: '排行榜', href: '/rank/index', icon: TrophyOutlined },
];
const secondary = computed(() => props.page.links.filter((link: any) => !primary.some(item => item.href === link.href || link.href === '/')));
const selected = computed(() => [props.page.section === 'contest-ng' ? 'contest' : props.page.section]);
const columns = [
  { title: '月份', dataIndex: 'month', key: 'month', width: 108 },
  { title: '姓名', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '过题', dataIndex: 'count', key: 'count', width: 64, align: 'right' as const },
];
</script>

<template>
  <ConfigProvider prefix-cls="oms-ant" :locale="zhCN" :theme="productTheme">
    <div class="oms-ui">
      <aside v-if="!page.inContest" class="oms-sidebar" aria-label="主导航">
        <a class="oms-brand" href="/index"><span class="oms-brand-mark"><CodeOutlined /></span><span>OJ Modern<small>Student</small></span></a>
        <div class="oms-nav-label">学习空间</div>
        <Menu mode="inline" :selected-keys="selected">
          <Menu.Item v-for="item in primary" :key="item.key"><template #icon><component :is="item.icon" /></template><a :href="item.href">{{ item.label }}</a></Menu.Item>
        </Menu>
        <div v-if="secondary.length" class="oms-nav-label oms-nav-more">更多</div>
        <nav class="oms-secondary"><a v-for="link in secondary" :key="link.href" :href="link.href"><FileTextOutlined />{{ link.label }}</a></nav>
        <button class="oms-sidebar-bottom" type="button" @click="openUpdates"><ReloadOutlined />检查更新<span>v{{ version }}</span></button>
      </aside>
      <header class="oms-header">
        <Button class="oms-mobile-menu" aria-label="展开导航" type="text" @click="open = true"><MenuOutlined /></Button>
        <a v-if="page.inContest" href="/index" class="oms-contest-brand"><CodeOutlined />OJ Modern</a>
        <nav v-if="page.inContest" class="oms-contest-nav" aria-label="全站导航"><a v-for="item in primary" :key="item.key" :href="item.href">{{ item.label }}</a><Dropdown v-if="secondary.length" :get-popup-container="(trigger: HTMLElement)=>trigger.parentElement!" :trigger="['click']"><Button type="text">更多</Button><template #overlay><Menu><Menu.Item v-for="link in secondary" :key="link.href"><a :href="link.href">{{ link.label }}</a></Menu.Item></Menu></template></Dropdown><Button type="text" @click="openUpdates"><ReloadOutlined />检查更新</Button></nav>
        <div v-else class="oms-breadcrumb"><span>学习空间</span><span>/</span><strong>{{ page.title }}</strong></div>
        <div class="oms-header-actions"><a v-if="page.account" :href="page.account.href" class="oms-account"><Avatar :size="30" style="background:#edf2ff;color:#2563eb">{{ page.account.name.slice(-2) }}</Avatar><span>{{ page.account.name }}</span></a><a v-else href="/user/login">登录</a><a v-if="page.logout" :href="page.logout" class="oms-logout">登出</a></div>
      </header>
      <Drawer v-model:open="open" title="学习空间" placement="left" :width="260" :get-container="false"><nav class="oms-mobile-links"><a v-for="item in primary" :key="item.key" :href="item.href"><component :is="item.icon" />{{ item.label }}</a><a v-for="link in secondary" :key="link.href" :href="link.href">{{ link.label }}</a><Button type="text" @click="openUpdates">检查更新</Button></nav></Drawer>
      <Modal v-model:open="updatesOpen" title="检查更新" :footer="null" :width="420" :get-container="false" destroy-on-close><UpdatePanel v-if="updatesOpen" /></Modal>

      <Courses v-if="page.courses" :sections="page.courses" />

      <main v-if="page.home" class="oms-dashboard">
        <div class="oms-page-heading"><div><h1>首页</h1></div></div>
        <div class="oms-shortcuts">
          <a v-for="item in primary.slice(1,4)" :key="item.key" :href="item.href" class="oms-shortcut"><span class="oms-shortcut-icon"><component :is="item.icon" /></span><span><strong>{{ item.label }}</strong></span><ArrowRightOutlined /></a>
        </div>
        <div class="oms-dashboard-grid">
          <section class="oms-home-main">
            <Card :bordered="false" class="oms-home-card"><template #title><div class="oms-card-title">待写题解<Badge :count="page.solutions.length" :number-style="{backgroundColor:'#eff4ff',color:'#2563eb',boxShadow:'none'}" /></div></template><template #extra><a href="/problem/accepted">全部 <ArrowRightOutlined /></a></template>
              <div v-if="page.solutions.length" class="oms-solution-list"><a v-for="item in page.solutions" :key="item.href" :href="item.href"><span class="oms-problem-id">{{ item.id }}</span><strong>{{ item.title }}</strong><span class="oms-row-action">写题解 <ArrowRightOutlined /></span></a></div>
              <Empty v-else description="暂无待写题解" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </Card>
            <Card title="题目推荐" :bordered="false" class="oms-home-card"><template #extra><a href="/problem/index">去题库 <ArrowRightOutlined /></a></template><div class="oms-recommendations"><a v-for="(item,index) in page.recommendations" :key="item.href" :href="item.href"><span>{{ String(Number(index)+1).padStart(2,'0') }}</span><strong>{{ item.title }}</strong><ArrowRightOutlined /></a></div><Empty v-if="!page.recommendations.length" description="暂无推荐题目" :image="Empty.PRESENTED_IMAGE_SIMPLE" /></Card>
          </section>
          <aside class="oms-home-aside">
            <Card title="赛季冠军" :bordered="false" class="oms-home-card oms-champions"><template #extra><TrophyOutlined style="color:#b18a46" /></template><Table :columns="columns" :data-source="page.champions" :pagination="{pageSize:5,size:'small',hideOnSinglePage:true,showSizeChanger:false}" size="small" table-layout="fixed"><template #bodyCell="{column,record}"><span v-if="column.key==='count'" class="oms-count-value">{{ record.count }}</span><span v-else>{{ record[String(column.key)] }}</span></template></Table></Card>
            <Card title="使用指南" :bordered="false" class="oms-home-card"><div class="oms-guides"><a v-for="item in page.guides" :key="item.href" :href="item.href" target="_blank" rel="noopener noreferrer"><FileTextOutlined /><span>{{ item.title }}</span><ArrowRightOutlined /></a></div></Card>
          </aside>
        </div>
        <Collapse v-if="page.notices.length" ghost class="oms-notices"><Collapse.Panel key="notice" header="站点公告"><p v-for="notice in page.notices" :key="notice">{{ notice }}</p></Collapse.Panel></Collapse>
        <footer class="oms-home-footer"><span>Accoding · OJ Modern Student</span><a v-if="page.terms" :href="page.terms" target="_blank" rel="noopener noreferrer">服务条款</a></footer>
      </main>
    </div>
  </ConfigProvider>
</template>

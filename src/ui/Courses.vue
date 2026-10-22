<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Button, Card, Empty, Input, Tabs, Tag } from 'ant-design-vue';
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons-vue';
type Course = {href: string; title: string};
type Group = {key: string; title: string; category: string; courses: Course[]};
type Section = {key: string; title: string; groups: Group[]};
const props = defineProps<{sections: Section[]}>();
const active = ref(props.sections[0]?.key);
const query = ref('');
const expanded = reactive(new Set<string>());
const groups = computed(() => {
  const term = query.value.trim().toLocaleLowerCase();
  return (props.sections.find(section=>section.key===active.value)?.groups || []).map(group=>({
    ...group, courses: group.courses.filter(course=>`${group.title} ${group.category} ${course.title}`.toLocaleLowerCase().includes(term)),
  })).filter(group=>group.courses.length);
});
function visible(group: Group) { return query.value.trim() || expanded.has(group.key) ? group.courses : group.courses.slice(0,3); }
function toggle(key: string) { expanded.has(key) ? expanded.delete(key) : expanded.add(key); }
</script>

<template>
  <main class="oms-dashboard oms-courses">
    <div class="oms-page-heading"><h1>我的课程</h1><Input v-model:value="query" allow-clear placeholder="搜索课程" aria-label="搜索课程" class="oms-course-search"><template #prefix><SearchOutlined /></template></Input></div>
    <Tabs v-model:active-key="active"><Tabs.TabPane v-for="section in sections" :key="section.key" :tab="section.title" /></Tabs>
    <div class="oms-course-grid">
      <Card v-for="group in groups" :key="group.key" :bordered="false" class="oms-course-card">
        <template #title><div class="oms-course-title"><strong>{{ group.title }}</strong><Tag color="blue">{{ group.category }}</Tag></div></template>
        <div class="oms-course-list"><a v-for="course in visible(group)" :key="course.href" :href="course.href"><span>{{ course.title }}</span><ArrowRightOutlined /></a></div>
        <Button v-if="!query.trim() && group.courses.length > 3" type="text" block :aria-expanded="expanded.has(group.key)" @click="toggle(group.key)">{{ expanded.has(group.key)?'收起':'展开全部（'+group.courses.length+'）' }}</Button>
      </Card>
    </div>
    <Empty v-if="!groups.length" :description="query.trim()?'没有找到相关课程':'暂无课程'" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
  </main>
</template>

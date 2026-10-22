<script setup lang="ts">
import { computed } from 'vue';
import { Popover } from 'ant-design-vue';
import { formatScore } from '../submissions.mjs';
import { parseScoreDetail } from '../score-detail.mjs';
const props=defineProps<{score?:string|number|null;detail?:string|null;pending?:boolean;error?:string}>();
const details=computed(()=>parseScoreDetail(props.detail));
</script>
<template>
  <span v-if="pending || score===null || score===undefined" :title="error">—</span>
  <Popover v-else placement="leftTop" :trigger="['hover','focus','click']" overlay-class-name="oms-score-popover">
    <template #title><div class="oms-score-detail-heading"><strong>评测详情</strong><span v-if="details.points.length">{{ details.points.length }} 个数据点</span></div></template>
    <template #content><div class="oms-score-detail">
      <div v-if="details.points.length" class="oms-score-detail-scroll"><table><thead><tr><th>数据点</th><th>结果</th><th>得分 / 满分</th><th>耗时</th><th>内存</th></tr></thead><tbody><tr v-for="(point,index) in details.points" :key="index"><td>{{ index+1 }}</td><td :class="point.result==='Accepted'?'oms-point-pass':'oms-point-fail'">{{ point.result }}</td><td :title="point.formula">{{ point.score }}</td><td>{{ point.time }}</td><td>{{ point.memory }}</td></tr></tbody></table></div>
      <pre v-if="details.message" class="oms-score-detail-message">{{ details.message }}</pre>
      <p v-if="!details.points.length && !details.message" class="oms-score-detail-empty">暂无评测详情</p>
    </div></template>
    <button type="button" class="oms-score-trigger" :aria-label="'分数 '+formatScore(score)+'，查看评测详情'">{{ formatScore(score) }}</button>
  </Popover>
</template>

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScoreDetail } from '../src/score-detail.mjs';
test('评测详情保留数据点顺序，按真实权重显示得分和满分',()=>{
  const details=parseScoreDetail('42\nAccepted | 1 * (10 / 100) | 3 ms | 1664 KB\nWrong Answer | 0 * (20 / 100) | 4 ms | 1688 KB\nAccepted | 0.3333333333 * (1 / 3) | 5 ms | 1700 KB\n');
  assert.equal(details.points.length,3);
  assert.deepEqual(details.points.map(p=>p.score),['10 / 10','0 / 20','11.11 / 33.33']);
  assert.equal(details.points[1].result,'Wrong Answer');
  assert.equal(details.points[1].formula,'0 * (20 / 100)');
  assert.equal(details.points[1].memory,'1688 KB');
  assert.equal(details.message,'');
});
test('编译错误和空详情保留原文，不冒充数据点',()=>{
  assert.deepEqual(parseScoreDetail('42\nCompile Error\n<script>alert(1)</script>'),{points:[],message:'Compile Error\n<script>alert(1)</script>'});
  assert.deepEqual(parseScoreDetail(null),{points:[],message:''});
  assert.equal(parseScoreDetail('42\nAccepted | custom | 3 ms | 1 KB').points[0].score,'custom');
});

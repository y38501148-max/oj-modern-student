import { formatScore } from './submissions.mjs';

export function parseScoreDetail(detail) {
  const lines=String(detail || '').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  if(/^\d+$/.test(lines[0]))lines.shift();
  const points=[],messages=[];
  for(const line of lines) {
    const fields=line.split(/\s*\|\s*/);
    if(fields.length!==4 || !/ms$/i.test(fields[2]) || !/KB$/i.test(fields[3])){messages.push(line);continue;}
    const [result,formula,time,memory]=fields;
    const fraction=formula.match(/^([\d.]+)\s*\*\s*\(\s*([\d.]+)\s*\/\s*([\d.]+)\s*\)$/);
    const weight=fraction?Number(fraction[2])/Number(fraction[3]):NaN;
    const score=Number.isFinite(weight) && Number.isFinite(Number(fraction?.[1]))?`${formatScore(Number(fraction[1])*weight)} / ${formatScore(weight)}`:formula;
    points.push({result,score,formula,time,memory});
  }
  return {points,message:messages.join('\n')};
}

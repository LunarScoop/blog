import { describe, expect, it } from 'vitest';
import results from '../../data/experiments/viewsrd.json';
import { chartType, displayValue, numericValue, validateConfig, type ExperimentConfig } from './config';

const config = () => structuredClone(results.charts.nr3d) as ExperimentConfig;
describe('experiment data integrity', () => {
  it('validates every published configuration', () => {
    for (const c of Object.values(results.charts)) expect(() => validateConfig(c)).not.toThrow();
  });
  it('keeps all benchmark values equal to their paper transcription', () => {
    for (const [key, offset] of [['nr3d',0],['sr3d',5]] as const) {
      for (const s of results.charts[key].series) expect(s.values).toEqual(results.tables.table1[s.name as keyof typeof results.tables.table1].slice(offset,offset+5));
    }
    expect(+(results.tables.table1.ViewSRD[0] - results.tables.table1.CoT3DRef[0]).toFixed(1)).toBe(5.5);
    expect(results.tables.table1.ViewSRD[8]).toBeLessThan(results.tables.table1.MiKASA[8]);
  });
  it('copies ablation, anchor and ScanRefer values without correcting suspect reports', () => {
    results.charts.anchors.series.forEach(s => expect(s.values).toEqual(results.tables.table2[s.name as keyof typeof results.tables.table2]));
    results.charts.ablation.series.forEach((s,i) => expect(s.values).toEqual(Object.values(results.tables.table4).map(v=>v[i===0 ? 0 : 3])));
    results.charts.scanrefer.series.forEach((s,i) => expect(s.values).toEqual(Object.values(results.tables.table3).map(v=>v[4+i])));
    expect(results.charts.scanrefer.source.note).toContain('不一致');
    expect(results.charts.scanrefer.series[0].values[3]).toBe(57.9);
  });
  it('preserves exactly the six reported train/test combinations and all missing cells', () => {
    let count = 0;
    for (const s of results.charts.viewMatrix.series) {
      const train = Number(s.name.split(' ')[1]);
      s.values.forEach((value,index) => {
        const test = Number(results.charts.viewMatrix.categories[index]);
        const row = results.tables.table5.find(r=>r.train===train && r.test===test);
        expect(value).toBe(row?.values[0] ?? null);
        if (value!==null) count++;
      });
    }
    expect(count).toBe(6);
    expect(results.charts.views.series[1].values[3]).toBeNull();
  });
  it('maps LLM and loss-weight observations to reported results', () => {
    expect(results.charts.llms.series[0].values).toEqual(Object.values(results.tables.table6));
    expect(results.charts.weights.series[0].values).toEqual(results.tables.supplementTable1.slice(2).map(v=>v[3]));
  });
});

describe('scientific values and chart selection', () => {
  it('distinguishes fractions, percentages, missing data and zero', () => {
    const c = config(); c.valueFormat = 'fraction';
    expect(displayValue(c,0.631)).toBe('63.1%');
    expect(numericValue(c,0.631)).toBe(63.1);
    expect(displayValue(c,0)).toBe('0.0%');
    expect(displayValue(c,null)).toContain('缺失');
    c.valueFormat = 'percent'; expect(displayValue(c,63.1)).toBe('63.1%');
  });
  it('rejects silent gaps, nonfinite results and clipped axes', () => {
    const c = config(); c.series[0].values.pop(); expect(()=>validateConfig(c)).toThrow('null');
    const c2 = config(); c2.series[0].values[0]=NaN; expect(()=>validateConfig(c2)).toThrow('有限');
    const c3 = config(); c3.yMax=60; expect(()=>validateConfig(c3)).toThrow('截掉');
    const c4 = config(); c4.yMin=50; expect(()=>validateConfig(c4)).toThrow('0 开始');
    const c5 = config(); c5.valueFormat='fraction'; expect(()=>validateConfig(c5)).toThrow('0–1');
  });
  it('selects chart types by experiment semantics', () => {
    const c=config(); expect(chartType(c)).toBe('bar');
    c.kind='training'; expect(chartType(c)).toBe('line');
    c.kind='hyperparameter'; expect(chartType(c)).toBe('heatmap');
    c.series=c.series.slice(0,1); expect(chartType(c)).toBe('line');
    c.chart='table'; expect(chartType(c)).toBe('table');
  });
});

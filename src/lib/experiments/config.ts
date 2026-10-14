export interface ExperimentConfig {
  id: string;
  title: string;
  kind: 'comparison' | 'ablation' | 'training' | 'hyperparameter' | 'benchmark';
  chart?: 'auto' | 'bar' | 'line' | 'heatmap' | 'table';
  metric: string;
  unit: string;
  valueFormat: 'number' | 'percent' | 'fraction';
  decimals: number;
  xLabel: string;
  categories: string[];
  series: { name: string; color?: string; values: (number | null)[] }[];
  source: { label: string; url: string; note: string };
  yMin?: number;
  yMax?: number;
}

export const palette = ['#60a5fa', '#34d399', '#c4b5fd', '#fbbf24', '#fb7185'];

// Explicit formats prevent the ambiguous conversion of 0.631 into 0.631%.
export function displayValue(config: ExperimentConfig, value: number | null) {
  if (value === null) return '缺失（未报告）';
  const scaled = config.valueFormat === 'fraction' ? value * 100 : value;
  return `${scaled.toFixed(config.decimals)}${config.unit}`;
}

export function numericValue(config: ExperimentConfig, value: number | null) {
  return value === null ? null : value * (config.valueFormat === 'fraction' ? 100 : 1);
}

export function chartType(config: ExperimentConfig) {
  if (config.chart && config.chart !== 'auto') return config.chart;
  if (config.kind === 'training') return 'line';
  if (config.kind === 'hyperparameter') return config.series.length > 1 ? 'heatmap' : 'line';
  return 'bar';
}

export function validateConfig(input: unknown): asserts input is ExperimentConfig {
  const c = input as ExperimentConfig;
  const fail = (message: string): never => { throw new Error(`实验图表配置错误：${message}`); };
  if (!c || typeof c !== 'object') fail('需要 JSON 对象');
  for (const key of ['id', 'title', 'metric', 'xLabel'] as const) {
    if (typeof c[key] !== 'string' || !c[key].trim()) fail(`${key} 不能为空`);
  }
  if (typeof c.unit !== 'string') fail('unit 必须显式设置');
  if (!['comparison', 'ablation', 'training', 'hyperparameter', 'benchmark'].includes(c.kind)) fail('未知实验类型');
  if (c.chart && !['auto', 'bar', 'line', 'heatmap', 'table'].includes(c.chart)) fail('未知图表类型');
  if (!['number', 'percent', 'fraction'].includes(c.valueFormat)) fail('必须指定原始数值格式');
  if (c.valueFormat !== 'number' && c.unit !== '%') fail('百分比或比例格式必须使用 % 单位');
  if (!Number.isInteger(c.decimals) || c.decimals < 0 || c.decimals > 10) fail('decimals 应为 0–10 的整数');
  if (!Array.isArray(c.categories) || !c.categories.length || c.categories.some(v => typeof v !== 'string' || !v.trim())) fail('categories 不能为空');
  if (new Set(c.categories).size !== c.categories.length) fail('categories 不应重复');
  if (!Array.isArray(c.series) || !c.series.length) fail('series 不能为空');
  for (const s of c.series) {
    if (!s || typeof s.name !== 'string' || !s.name.trim()) fail('系列名称不能为空');
    if (s.color && !/^#[\da-f]{6}$/i.test(s.color)) fail('颜色应为六位 HEX');
    if (!Array.isArray(s.values) || s.values.length !== c.categories.length) fail(`${s.name} 的数值数量与分类数量不一致；缺失值请用 null`);
    for (const v of s.values) {
      if (v !== null && (typeof v !== 'number' || !Number.isFinite(v))) fail('仅支持有限数值或 null，禁止补零');
      if (v !== null && c.valueFormat === 'fraction' && (v < 0 || v > 1)) fail('fraction 数值应在 0–1 内');
      if (v !== null && c.valueFormat === 'percent' && (v < 0 || v > 100)) fail('percent 数值应在 0–100 内');
    }
  }
  if (new Set(c.series.map(s => s.name)).size !== c.series.length) fail('系列名称不应重复');
  if (!c.source || !c.source.label || typeof c.source.note !== 'string' || !/^https?:\/\//.test(c.source.url)) fail('需要来源名称、HTTP(S) 链接及来源说明');
  const values = c.series.flatMap(s => s.values).filter((v): v is number => v !== null).map(v => numericValue(c, v)!);
  for (const bound of [c.yMin, c.yMax]) if (bound !== undefined && !Number.isFinite(bound)) fail('坐标范围必须有限');
  if (c.yMin !== undefined && values.some(v => v < c.yMin!)) fail('yMin 会截掉数据');
  if (c.yMax !== undefined && values.some(v => v > c.yMax!)) fail('yMax 会截掉数据');
  if (c.yMin !== undefined && c.yMax !== undefined && c.yMin >= c.yMax) fail('坐标范围无效');
  if (chartType(c) === 'bar' && c.yMin !== undefined && c.yMin !== 0) fail('柱状图应从 0 开始，避免夸大差异');
}

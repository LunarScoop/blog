import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { chartType, displayValue, numericValue, palette, validateConfig, type ExperimentConfig } from '../lib/experiments/config';

type Point = { seriesIndex: number; dataIndex: number };
type ChartEvent = Point & { componentType?: string; event?: { offsetX: number; offsetY: number } };

class ExperimentChart extends HTMLElement {
  private chart?: EChartsType;
  private config!: ExperimentConfig;
  private controller?: AbortController;
  private resizeObserver?: ResizeObserver;
  private themeObserver?: MutationObserver;
  private active: Point | null = null;
  private pinned = false;
  private cursor = -1;
  private points: Point[] = [];
  private generation = 0;

  connectedCallback() { void this.mount(); }
  disconnectedCallback() { this.cleanup(); }

  private cleanup() {
    this.generation++;
    this.controller?.abort();
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
    this.controller = undefined;
  }

  private async mount() {
    if (this.controller) return;
    const generation = ++this.generation;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    try {
      const config: unknown = JSON.parse(this.querySelector('[data-config]')!.textContent!);
      validateConfig(config);
      this.config = config;
      this.points = config.categories.flatMap((_, dataIndex) => config.series.map((_, seriesIndex) => ({ seriesIndex, dataIndex })));
      const plot = this.querySelector<HTMLElement>('.experiment__plot');
      if (plot) {
        const { init } = await import('../lib/experiments/echarts');
        if (!this.isConnected || signal.aborted || generation !== this.generation) return;
        this.chart = init(plot, null, { renderer: 'svg' });
        this.render();
        this.chart.on('mouseover', (raw: unknown) => {
          const p = raw as ChartEvent;
          if (!this.pinned && p.componentType === 'series') this.select(this.resolvePoint(p));
        });
        this.chart.on('mouseout', () => { if (!this.pinned) this.clear(); });
        this.chart.on('click', (raw: unknown) => {
          const p = raw as ChartEvent;
          if (p.componentType === 'series') this.toggle(this.resolvePoint(p));
        });
        this.chart.getZr().on('click', (event: { target?: unknown }) => { if (!event.target) this.clear(); });
        this.resizeObserver = new ResizeObserver(() => {
          this.render();
          this.chart?.resize();
          if (this.active) this.showTooltip(this.active);
        });
        this.resizeObserver.observe(plot);
        this.themeObserver = new MutationObserver(() => this.render());
        this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        plot.addEventListener('keydown', event => this.onKey(event), { signal });
        plot.addEventListener('blur', () => { if (!this.pinned) this.clear(); }, { signal });
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        motion.addEventListener('change', () => this.render(), { signal });
      }
      this.querySelectorAll<HTMLButtonElement>('[data-point]').forEach(button => {
        const [seriesIndex, dataIndex] = button.dataset.point!.split(':').map(Number);
        const p = { seriesIndex, dataIndex };
        button.addEventListener('focus', () => { if (!this.pinned) this.select(p); }, { signal });
        button.addEventListener('blur', () => { if (!this.pinned) this.clear(); }, { signal });
        button.addEventListener('click', () => this.toggle(p), { signal });
      });
      this.querySelector<HTMLButtonElement>('[data-clear]')?.addEventListener('click', () => this.clear(), { signal });
      this.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(button => {
        button.disabled = !this.chart;
        button.addEventListener('click', () => void this.exportImage(button.dataset.export as 'svg' | 'png'), { signal });
      });
      document.addEventListener('pointerdown', event => {
        const target = event.target as Element;
        if (this.pinned && (!this.contains(target) || !target.closest('.experiment__plot,button,summary'))) this.clear();
      }, { signal });
      document.addEventListener('keydown', event => { if (event.key === 'Escape') this.clear(); }, { signal });
      document.addEventListener('astro:before-swap', () => this.cleanup(), { once: true, signal });
      this.dataset.ready = 'true';
    } catch (error) {
      const status = this.querySelector<HTMLElement>('.experiment__help')!;
      status.textContent = '图表加载失败，请使用下方数据表。';
      status.hidden = false;
      this.querySelector('details')?.setAttribute('open', '');
      console.error(error);
    }
  }

  private color(i: number) { return this.config.series[i].color || palette[i % palette.length]; }

  private render() {
    if (!this.chart) return;
    const c = this.config;
    const type = chartType(c);
    const light = document.documentElement.dataset.theme === 'light';
    const text = light ? '#475569' : '#aab8cc';
    const grid = light ? '#dce4ef' : '#263447';
    const plot = this.querySelector<HTMLElement>('.experiment__plot')!;
    const mobile = plot.clientWidth < 580;
    const horizontal = type === 'bar' && (mobile || c.categories.some(v => v.length > 14));
    const height = horizontal ? Math.max(350, c.categories.length * (c.series.length > 2 ? 78 : 55) + 100) : 380;
    if (plot.style.height !== `${height}px`) plot.style.height = `${height}px`;
    const opacity = (s: number, d: number) => !this.active || (this.active.seriesIndex === s && this.active.dataIndex === d) ? 1 : 0.22;
    const axis = { axisLabel: { color: text, fontSize: 11 }, axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, nameTextStyle: { color: text, fontSize: 11 }, nameLocation: 'middle', nameGap: 34 };
    const numericX = type === 'line' && c.categories.every(v => v.trim() !== '' && Number.isFinite(Number(v)));
    const xValues = c.categories.map(Number);
    const steps = xValues.slice(1).map((v, i) => v - xValues[i]);
    const uniformStep = numericX && steps.length && steps[0] > 0 && steps.every(v => Math.abs(v - steps[0]) < 1e-10) ? steps[0] : undefined;
    const categoryAxis = { ...axis, type: 'category', data: c.categories, name: c.xLabel,
      axisLabel: { ...axis.axisLabel, interval: 0, width: horizontal ? (mobile ? 95 : 170) : (plot.clientWidth / c.categories.length - 14), overflow: 'break', lineHeight: 15 },
      ...(horizontal ? { inverse: true, nameLocation: 'start', nameGap: 14, name: c.xLabel } : {}) };
    const valueAxis = { ...axis, type: 'value', name: `${c.metric} (${c.unit || '无量纲'})`, min: c.yMin ?? (type === 'bar' ? 0 : undefined), max: c.yMax, splitLine: { lineStyle: { color: grid, type: 'dashed' } } };
    const option: EChartsCoreOption = {
      backgroundColor: light ? '#f5f8fc' : '#101923',
      animation: false,
      grid: { left: horizontal ? (mobile ? 100 : 175) : 50, right: 16, top: 35, bottom: type === 'heatmap' ? 90 : 60 },
      xAxis: type === 'heatmap' ? { ...categoryAxis, splitArea: { show: false } } : horizontal ? valueAxis : numericX ? { ...axis, type: 'value', name: c.xLabel, min: 'dataMin', max: 'dataMax', interval: uniformStep, axisLabel: { ...axis.axisLabel, formatter: (v: number) => Number(v.toPrecision(12)).toString() }, splitLine: { show: false } } : categoryAxis,
      yAxis: type === 'heatmap' ? { ...axis, type: 'category', data: c.series.map(s => s.name), axisLabel: { color: text, width: mobile ? 65 : 130, overflow: 'truncate' } } : horizontal ? categoryAxis : valueAxis,
      ...(c.categories.length > 12 && !horizontal ? { dataZoom: [{ type: 'slider', xAxisIndex: 0, bottom: 0, height: 18, textStyle: { color: text }, start: 0, end: Math.min(100, 12 / c.categories.length * 100) }] } : {}),
      series: c.series.map((s, i) => ({
        name: s.name, type, color: this.color(i),
        ...(type === 'line' ? { connectNulls: false, symbol: 'circle', symbolSize: 9, showSymbol: true, lineStyle: { width: 2, opacity: this.active && this.active.seriesIndex !== i ? 0.22 : 1 } } : {}),
        ...(type === 'bar' ? { barMaxWidth: 30, barGap: '25%' } : {}),
        emphasis: { disabled: true },
        ...(type === 'heatmap' ? { label: { show: true, color: '#fff', fontSize: mobile ? 10 : 12, formatter: (p: { value: number[] }) => `${p.value[2].toFixed(c.decimals)}${c.unit}` } } : {}),
        data: s.values.map((v, d) => ({
          value: type === 'heatmap' ? [d, i, numericValue(c, v)] : numericX ? [Number(c.categories[d]), numericValue(c, v)] : numericValue(c, v),
          itemStyle: { opacity: opacity(i, d), ...(type === 'bar' ? { borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] } : {}) },
        })).filter(p => type !== 'heatmap' || (p.value as unknown[])[2] !== null),
      })),
    };
    if (type === 'heatmap') {
      const values = c.series.flatMap(s => s.values).filter((v): v is number => v !== null).map(v => numericValue(c, v)!);
      option.grid = { left: mobile ? 75 : 140, right: 16, top: 24, bottom: 90 };
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 1;
      option.visualMap = { min, max, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#1e3a5f', '#60a5fa', '#34d399'] }, textStyle: { color: text }, text: [`${max.toFixed(c.decimals)}${c.unit}`, `${min.toFixed(c.decimals)}${c.unit}`] };
    }
    this.chart.setOption(option, { notMerge: true });
  }

  private resolvePoint(p: Point): Point {
    // Heatmap data omits missing cells; map the compact ECharts index back to JSON.
    if (chartType(this.config) !== 'heatmap') return p;
    const indices = this.config.series[p.seriesIndex].values.map((v, i) => v === null ? -1 : i).filter(i => i >= 0);
    return { seriesIndex: p.seriesIndex, dataIndex: indices[p.dataIndex] };
  }

  private select(p: Point) {
    this.active = { seriesIndex: p.seriesIndex, dataIndex: p.dataIndex };
    this.cursor = this.points.findIndex(x => x.seriesIndex === p.seriesIndex && x.dataIndex === p.dataIndex);
    this.dataset.active = `${p.seriesIndex}:${p.dataIndex}`;
    this.render();
    this.showTooltip(p);
  }

  private showTooltip(p: Point) {
    const c = this.config;
    const tooltip = this.querySelector<HTMLElement>('.experiment__tooltip')!;
    const s = c.series[p.seriesIndex];
    let color = this.color(p.seriesIndex);
    if (this.chart && chartType(c) === 'heatmap' && s.values[p.dataIndex] !== null) {
      const index = s.values.slice(0, p.dataIndex + 1).filter(v => v !== null).length - 1;
      color = this.chart.getVisual({ seriesIndex: p.seriesIndex, dataIndex: index }, 'color') as string;
    }
    this.querySelector<HTMLElement>('[data-tip-color]')!.style.background = color;
    this.querySelector('[data-tip-text]')!.textContent = `${c.title}\n${c.xLabel}：${c.categories[p.dataIndex]} · ${s.name}\n${c.metric}：${displayValue(c, s.values[p.dataIndex])}`;
    tooltip.hidden = false;
    tooltip.style.left = '12px';
    tooltip.style.top = `${this.querySelector<HTMLElement>('.experiment__plot')?.offsetTop ?? 80}px`;
    const clearButton = this.querySelector<HTMLButtonElement>('[data-clear]');
    if (clearButton) clearButton.disabled = !this.pinned;
  }

  private toggle(p: Point) {
    if (this.pinned && this.active?.seriesIndex === p.seriesIndex && this.active.dataIndex === p.dataIndex) this.clear();
    else { this.pinned = true; this.dataset.pinned = 'true'; this.select(p); }
  }

  private clear() {
    this.active = null;
    this.pinned = false;
    delete this.dataset.pinned;
    delete this.dataset.active;
    this.querySelector<HTMLElement>('.experiment__tooltip')!.hidden = true;
    const clearButton = this.querySelector<HTMLButtonElement>('[data-clear]');
    if (clearButton) clearButton.disabled = true;
    this.render();
  }

  private onKey(event: KeyboardEvent) {
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') this.cursor = 0;
      else if (event.key === 'End') this.cursor = this.points.length - 1;
      else this.cursor = (this.cursor + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + this.points.length) % this.points.length;
      this.pinned = false;
      delete this.dataset.pinned;
      this.select(this.points[this.cursor]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle(this.active ?? this.points[0]);
    } else if (event.key === 'Escape') this.clear();
  }

  private async exportImage(format: 'svg' | 'png') {
    if (!this.chart) return;
    const buttons = this.querySelectorAll<HTMLButtonElement>('[data-export]');
    buttons.forEach(b => b.disabled = true);
    try {
      // Export a neutral view including title, units and legend, without hover dimming.
      const selected = this.active;
      this.active = null;
      this.render();
      const body = this.chart.renderToSVGString();
      this.active = selected;
      this.render();
      const width = this.chart.getWidth(), height = this.chart.getHeight();
      const light = document.documentElement.dataset.theme === 'light';
      const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
      const measure = document.createElement('canvas').getContext('2d')!;
      measure.font = '12px sans-serif';
      const wrap = (text: string, maxWidth: number) => {
        const lines: string[] = []; let line = '';
        for (const character of text) {
          if (line && measure.measureText(line + character).width > maxWidth) { lines.push(line); line = ''; }
          line += character;
        }
        if (line) lines.push(line);
        return lines;
      };
      const textLines = (text: string, x: number, y: number) => wrap(text, width - x - 12).map((line, i) => `<text x="${x}" y="${y + i * 18}">${escape(line)}</text>`).join('');
      let header = textLines(this.config.title, 12, 22);
      let headerHeight = wrap(this.config.title, width - 24).length * 18 + 18;
      if (chartType(this.config) !== 'heatmap') {
        this.config.series.forEach((s, i) => {
          header += `<rect x="12" y="${headerHeight - 9}" width="9" height="9" rx="2" fill="${this.color(i)}"/>${textLines(s.name, 29, headerHeight)}`;
          headerHeight += wrap(s.name, width - 41).length * 18;
        });
      }
      header += textLines(`${this.config.metric} (${this.config.unit || '无量纲'})`, 12, headerHeight);
      headerHeight += wrap(`${this.config.metric} (${this.config.unit || '无量纲'})`, width - 24).length * 18 + 8;
      const footnote = `${this.config.source.label}：${this.config.source.note}`;
      const exportHeight = headerHeight + height + wrap(footnote, width - 24).length * 18 + 26;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${exportHeight}"><rect width="100%" height="100%" fill="${light ? '#f5f8fc' : '#101923'}"/><g fill="${light ? '#1e293b' : '#e2e8f0'}" font-family="sans-serif" font-size="12">${header}${textLines(footnote, 12, headerHeight + height + 18)}</g><g transform="translate(0,${headerHeight})">${body}</g></svg>`;
      let blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      if (format === 'png') {
        const objectURL = URL.createObjectURL(blob);
        try {
          const img = new Image();
          img.src = objectURL;
          await img.decode();
          const canvas = document.createElement('canvas');
          canvas.width = width * 2; canvas.height = exportHeight * 2;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('PNG 导出失败')), 'image/png'));
        } finally { URL.revokeObjectURL(objectURL); }
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `${this.config.id}.${format}`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      const status = this.querySelector<HTMLElement>('.experiment__help')!;
      status.textContent = '导出失败，请重试或使用数据表。';
      status.hidden = false;
      console.error(error);
    } finally { if (this.isConnected) buttons.forEach(b => b.disabled = false); }
  }
}

if (!customElements.get('experiment-chart')) customElements.define('experiment-chart', ExperimentChart);

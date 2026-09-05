import { describe, expect, it } from 'vitest';
import { getReadingStats } from './reading-stats';

describe('article reading statistics', () => {
	it('counts Chinese characters and English words, including adjacent mixed text', () => {
		expect(getReadingStats('脑电EEG分析，Qwen3-235B tools，69.30%。')).toEqual({
			wordCount: 8,
			readingTime: 1,
		});
	});

	it('counts visible Markdown labels and captions without counting markup or link destinations', () => {
		const body = '# 标题\n\n**脑电** [论文](https://example.com/a-long-paper-path) ![框架图](images/diagram.png) `compute_psd`\n\n<https://example.com/project>';
		expect(getReadingStats(body).wordCount).toBe(10);
	});

	it('excludes fenced code, diagrams, equations, and hidden HTML content', () => {
		const body = [
			'正文',
			'```mermaid\nflowchart LR\n    a["Hidden diagram source"] --> b["More source"]\n```',
			'~~~ts\nconst source = "Not prose";\n~~~',
			'$$\n\\sum_{i=1}^{n} x_i\n$$',
			'<!-- Hidden comment -->',
			'<script>console.log("Not prose");</script>',
			'<style>.hidden { color: red; }</style>',
		].join('\n\n');
		expect(getReadingStats(body)).toEqual({ wordCount: 2, readingTime: 1 });
	});

	it('counts table cells and visible HTML text once', () => {
		const body = '| 方法 | Result |\n| --- | --- |\n| EEG | 69.30% |\n\n<div>脑电分析</div>';
		expect(getReadingStats(body).wordCount).toBe(9);
	});

	it('keeps article counts independent and derives reading time from the same count', () => {
		expect(getReadingStats('旧'.repeat(401))).toEqual({ wordCount: 401, readingTime: 2 });
		expect(getReadingStats('新文章')).toEqual({ wordCount: 3, readingTime: 1 });
		expect(getReadingStats('')).toEqual({ wordCount: 0, readingTime: 0 });
	});
});

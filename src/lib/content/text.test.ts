import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contentFormat } from './parser';
import { extractExcerpt, extractSeoDescription, stripMarkdownAndHtml } from './text';

const MDX = `import Chart from './Chart.astro';
import {
  helper as renamedHelper,
} from './hidden-module';

export const config = { privateValue: 'not prose' };

export function Component() {
  return <div>not rendered declaration</div>;
}

正文介绍 **实验结果**，通过 [论文](https://example.com) 分析方法。

<Chart data={{ secret: 'hidden props' }} />

<Callout>
保留组件包裹的文字。
</Callout>

{config.privateValue}

<script>notVisible()</script>
`;

describe('readable article excerpts', () => {
  it('skips MDX modules, expressions and attributes without executing code', () => {
    expect(stripMarkdownAndHtml(MDX, 'mdx')).toBe('正文介绍 实验结果，通过 论文 分析方法。 保留组件包裹的文字。');
    expect(extractSeoDescription(MDX, 160, 'mdx')).not.toMatch(/import|export|privateValue|notVisible|hidden props/);
  });
  it('keeps normal Markdown, fenced-code exclusions and the more marker', () => {
    expect(extractExcerpt('**引言**和[链接](https://example.com)。\n\n```js\nimport x from "x";\n```\n\n正文\n\n<!-- more -->\n\n后文')).toBe('引言和链接。 正文');
    expect(stripMarkdownAndHtml('import 是这篇 Markdown 文章讨论的关键词。')).toContain('import');
    expect(extractExcerpt('123456789',5)).toBe('1234…');
  });
  it('starts the real ViewSRD excerpt with prose rather than component imports', () => {
    const article = readFileSync(new URL('../../content/blog/viewsrd-3d-visual-grounding.mdx', import.meta.url), 'utf8');
    const body = article.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
    const excerpt = extractExcerpt(body,160,'mdx');
    expect(excerpt).toMatch(/^三维视觉定位/);
    expect(excerpt).not.toMatch(/import|\.astro|results\.charts|ExperimentChart|ViewpointComparison/);
  });
  it('uses the actual content file extension to distinguish Markdown from MDX', () => {
    expect(contentFormat('src/content/blog/article.MDX')).toBe('mdx');
    expect(contentFormat('src/content/blog/article.md')).toBe('md');
    expect(contentFormat()).toBe('md');
  });
});

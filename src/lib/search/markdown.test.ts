import { describe, expect, it } from 'vitest';
import { parseSearchBlocks } from './markdown';

const ARTICLE = `
# 全文索引

段落包含 **强调文字** 和 \`inlineCall()\`。

| 功能 | 状态 |
| --- | --- |
| 搜索 | 可用 |

\`\`\`ts
const uniqueCodeToken = 'searchable';
\`\`\`

$$
E = mc^2
$$
`;

describe('Markdown search blocks', () => {
	it('indexes MDX prose and math with the same IDs as the rendered article tree', () => {
		const body = 'import Chart from "./Chart.astro";\n\nexport const data = { hidden: "internal" };\n\n# 实验\n\n正文 **准确率**。\n\n<Chart config={data} />\n\n{data.hidden}\n\n$$\nx^2\n$$';
		const blocks = parseSearchBlocks(body, 'mdx');
		expect(blocks.some(b=>b.text.includes('正文 准确率'))).toBe(true);
		expect(blocks.some(b=>b.type==='math' && b.text==='x^2')).toBe(true);
		expect(blocks.some(b=>/import|export|config|internal|Chart/.test(b.text))).toBe(false);
		const plain = parseSearchBlocks('# 实验\n\n正文 **准确率**。\n\n$$\nx^2\n$$');
		expect(blocks).toEqual(plain);
	});
	it('extracts readable prose, tables, code and math', () => {
		const blocks = parseSearchBlocks(ARTICLE);
		expect(blocks.some((block) => block.type === 'heading' && block.text === '全文索引')).toBe(true);
		expect(blocks.some((block) => block.type === 'paragraph' && block.text.includes('inlineCall()'))).toBe(true);
		expect(blocks.some((block) => block.type === 'table' && block.text.includes('搜索 可用'))).toBe(true);
		expect(blocks.some((block) => block.type === 'code' && block.text.includes('uniqueCodeToken'))).toBe(true);
		expect(blocks.some((block) => block.type === 'math' && block.text.includes('mc^2'))).toBe(true);
	});

	it('keeps unchanged block IDs stable when content is reordered', () => {
		const first = parseSearchBlocks('第一段\n\n第二段');
		const reordered = parseSearchBlocks('第二段\n\n第一段');
		const firstId = first.find((block) => block.text === '第一段')?.id;
		expect(reordered.find((block) => block.text === '第一段')?.id).toBe(firstId);
	});

	it('does not index script or style payloads from raw HTML', () => {
		const blocks = parseSearchBlocks('<script>secret()</script>\n\n<style>.hidden{}</style>');
		expect(blocks).toEqual([]);
	});
});

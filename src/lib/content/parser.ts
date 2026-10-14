import type { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

export type ContentFormat = 'md' | 'mdx';
const markdownParser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
const mdxParser = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkMdx);

export function contentFormat(filePath?: string): ContentFormat {
	return /\.mdx$/i.test(filePath ?? '') ? 'mdx' : 'md';
}

/** Parse source without evaluating imports, exports or JSX expressions. */
export function parseContentTree(body: string, format: ContentFormat = 'md'): Root {
	return (format === 'mdx' ? mdxParser : markdownParser).parse(body) as Root;
}

export function isHiddenContent(node: { type: string; name?: string | null }): boolean {
	return node.type === 'mdxjsEsm'
		|| node.type === 'mdxFlowExpression'
		|| node.type === 'mdxTextExpression'
		|| ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement')
			&& (node.name === 'script' || node.name === 'style'));
}

export function visibleHtmlText(value: string): string {
	return value
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ');
}

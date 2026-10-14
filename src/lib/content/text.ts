import { isHiddenContent, parseContentTree, visibleHtmlText, type ContentFormat } from './parser';

const MORE_MARKER = '<!-- more -->';

function trimToLength(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	const sliced = text.slice(0, Math.max(0, maxLength - 1)).trimEnd();
	return `${sliced}…`;
}

type ReadableNode = { type: string; value?: string; name?: string | null; children?: ReadableNode[] };

function readableNodeText(node: ReadableNode): string {
	if (isHiddenContent(node) || ['code', 'inlineCode', 'math', 'inlineMath', 'definition'].includes(node.type)) return '';
	if (node.type === 'text') return node.value ?? '';
	if (node.type === 'html') return visibleHtmlText(node.value ?? '');
	const children = (node.children ?? []).map(readableNodeText);
	if (node.type === 'tableRow') return `${children.join(' ')}\n`;
	const text = children.join('');
	return node.type === 'paragraph' || node.type === 'heading' ? `${text}\n` : text;
}

export function stripMarkdownAndHtml(text: string, format: ContentFormat = 'md'): string {
	return readableNodeText(parseContentTree(text, format)).replace(/\s+/g, ' ').trim();
}

export function extractExcerpt(body: string, maxLength = 150, format: ContentFormat = 'md'): string {
	const source = body || '';
	const moreIndex = source.indexOf(MORE_MARKER);
	const beforeMore = moreIndex >= 0 ? source.slice(0, moreIndex) : source;
	const cleaned = stripMarkdownAndHtml(beforeMore, format);
	if (!cleaned) return '';
	return trimToLength(cleaned, maxLength);
}

export function extractSeoDescription(body: string, maxLength = 160, format: ContentFormat = 'md'): string {
	return extractExcerpt(body, maxLength, format);
}

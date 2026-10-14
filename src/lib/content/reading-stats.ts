import { SKIP, visit } from 'unist-util-visit';
import { isHiddenContent, parseContentTree, visibleHtmlText, type ContentFormat } from './parser';

const CJK_CHARACTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const WORD = /[\p{L}\p{N}]+(?:[._'’-][\p{L}\p{N}]+)*/gu;

/** Count readable text in one article body, excluding code and diagram sources. */
export function getReadingStats(body: string, format: ContentFormat = 'md'): { wordCount: number; readingTime: number } {
	const parts: string[] = [];
	visit(parseContentTree(body, format), (node) => {
		if (isHiddenContent(node)) return SKIP;
		if (node.type === 'text' || node.type === 'inlineCode') {
			parts.push(node.value);
		} else if (node.type === 'image' || node.type === 'imageReference') {
			// The site's Markdown renderer also displays image alt text as a caption.
			parts.push(node.alt ?? '');
		} else if (node.type === 'html') {
			parts.push(visibleHtmlText(node.value));
		}
	});

	const text = parts.join(' ').replace(/(?:https?:\/\/|mailto:)\S+/giu, ' ');
	const characters = text.match(CJK_CHARACTER)?.length ?? 0;
	const words = text.replace(CJK_CHARACTER, ' ').match(WORD)?.length ?? 0;
	const wordCount = characters + words;
	return { wordCount, readingTime: Math.ceil(wordCount / 400) };
}

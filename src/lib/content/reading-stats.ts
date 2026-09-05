import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
const CJK_CHARACTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const WORD = /[\p{L}\p{N}]+(?:[._'’-][\p{L}\p{N}]+)*/gu;

/** Count readable text in one article body, excluding code and diagram sources. */
export function getReadingStats(body: string): { wordCount: number; readingTime: number } {
	const parts: string[] = [];
	visit(parser.parse(body), (node) => {
		if (node.type === 'text' || node.type === 'inlineCode') {
			parts.push(node.value);
		} else if (node.type === 'image' || node.type === 'imageReference') {
			// The site's Markdown renderer also displays image alt text as a caption.
			parts.push(node.alt ?? '');
		} else if (node.type === 'html') {
			parts.push(node.value
				.replace(/<!--[\s\S]*?-->/g, ' ')
				.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
				.replace(/<[^>]+>/g, ' '));
		}
	});

	const text = parts.join(' ').replace(/(?:https?:\/\/|mailto:)\S+/giu, ' ');
	const characters = text.match(CJK_CHARACTER)?.length ?? 0;
	const words = text.replace(CJK_CHARACTER, ' ').match(WORD)?.length ?? 0;
	const wordCount = characters + words;
	return { wordCount, readingTime: Math.ceil(wordCount / 400) };
}

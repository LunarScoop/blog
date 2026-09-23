import { visit } from 'unist-util-visit';

/**
 * Opens external article links in a separate tab without changing navigation
 * inside the blog itself.
 */
export function rehypeExternalLinks() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'a') return;

			const href = node.properties?.href;
			if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) return;

			node.properties = {
				...node.properties,
				target: '_blank',
				rel: 'noopener noreferrer',
			};
		});
	};
}

export default rehypeExternalLinks;

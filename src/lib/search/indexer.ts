import type { BlogPost } from '../content/blog';
import type { Project } from '../content/projects';
import { extractExcerpt } from '../content/text';
import { parseSearchBlocks } from './markdown';
import type { SearchDocument } from './types';

export function createSearchDocument(post: BlogPost): SearchDocument {
	const body = post.body ?? '';
	const excerpt = extractExcerpt(body, 200);
	return {
		id: post.id,
		title: post.data.title,
		description: post.data.description?.trim() || excerpt,
		excerpt,
		tags: post.data.tags,
		categories: post.data.categories,
		url: `/blog/${post.id}/`,
		blocks: parseSearchBlocks(body),
	};
}

export function createSearchIndex(posts: BlogPost[]): SearchDocument[] {
	return posts.map(createSearchDocument);
}

export function createProjectSearchDocument(project: Project): SearchDocument {
	const body = project.body ?? '';
	const excerpt = extractExcerpt(body, 200);
	return {
		id: `project:${project.id}`,
		title: project.data.title,
		description: project.data.description.trim() || excerpt,
		excerpt,
		tags: project.data.technologies,
		categories: ['Projects'],
		url: `/projects/${project.id}/`,
		blocks: parseSearchBlocks(body),
	};
}

export function createCombinedSearchIndex(posts: BlogPost[], projects: Project[]): SearchDocument[] {
	return [...createSearchIndex(posts), ...projects.map(createProjectSearchDocument)];
}

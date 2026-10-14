import { describe, expect, it } from 'vitest';
import type { Project } from '../content/projects';
import { createProjectSearchDocument } from './indexer';
import { createSearchDocument } from './indexer';
import type { BlogPost } from '../content/blog';

describe('createProjectSearchDocument', () => {
	it('uses MDX-aware excerpts and search blocks for MDX blog entries', () => {
		const post: BlogPost = {
			id:'mdx-example', collection:'blog', filePath:'src/content/blog/example.mdx',
			body:'import Chart from "./Chart.astro";\n\n正文摘要\n\n<Chart />',
			data:{ title:'Example', description:'', pubDate:new Date('2026-10-12'), updatedDate:undefined, tags:[], categories:[] },
		};
		const doc = createSearchDocument(post);
		expect(doc.excerpt).toBe('正文摘要');
		expect(doc.description).toBe('正文摘要');
		expect(doc.blocks.map(b=>b.text)).toEqual(['正文摘要']);
	});
	it('maps project metadata and body blocks into the existing search format', () => {
		const project = {
			id: 'tiny-web-server',
			body: '## Project overview\n\nA small HTTP server built with sockets.',
			data: {
				title: 'Tiny Web Server',
				description: 'A small web server project.',
				status: 'active',
				technologies: ['C++', 'Linux', 'Socket'],
				featured: true,
				created: new Date('2026-07-18'),
				updated: new Date('2026-07-24'),
				draft: false,
			},
		} as Project;

		const document = createProjectSearchDocument(project);

		expect(document.id).toBe('project:tiny-web-server');
		expect(document.url).toBe('/projects/tiny-web-server/');
		expect(document.categories).toEqual(['Projects']);
		expect(document.tags).toEqual(['C++', 'Linux', 'Socket']);
		expect(document.blocks.some((block) => block.type === 'heading')).toBe(true);
	});
});

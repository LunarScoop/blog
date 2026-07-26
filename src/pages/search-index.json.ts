import { getBlogPosts } from '../lib/content/blog';
import { getProjects } from '../lib/content/projects';
import { createCombinedSearchIndex } from '../lib/search/indexer';

export async function GET() {
    const posts = await getBlogPosts();
	const projects = await getProjects();

	const searchIndex = createCombinedSearchIndex(posts, projects);

	return new Response(JSON.stringify(searchIndex), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600',
		},
	});
}

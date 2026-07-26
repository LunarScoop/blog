import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type ProjectStatus = Project['data']['status'];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
	active: 'Active',
	completed: 'Completed',
	archived: 'Archived',
};

export function sortProjectsByDateDesc(projects: Project[]): Project[] {
	return [...projects].sort((a, b) => {
		const left = a.data.updated ?? a.data.created;
		const right = b.data.updated ?? b.data.created;
		return right.valueOf() - left.valueOf();
	});
}

export async function getProjects(): Promise<Project[]> {
	const projects = await getCollection('projects', ({ data }) => !data.draft);
	return sortProjectsByDateDesc(projects);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
	const projects = await getProjects();
	return projects.filter((project) => project.data.featured).slice(0, limit);
}

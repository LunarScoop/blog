import { cleanupParallax } from './parallax';

export type PageEnhancementId = 'home' | 'about' | 'blog-list' | 'tags-index' | 'tag-detail';
type PageEnhancementHandler = () => void;
type PageEnhancementLoader = () => Promise<PageEnhancementHandler>;

const loaders: Record<PageEnhancementId, PageEnhancementLoader> = {
	home: () => import('./home.client').then(({ initHomePage }) => initHomePage),
	about: () => import('./about.client').then(({ initAboutPage }) => initAboutPage),
	'blog-list': () => import('./blog-list.client').then(({ initBlogListPage }) => initBlogListPage),
	'tags-index': () => import('./tags-index.client').then(({ initTagsIndexPage }) => initTagsIndexPage),
	'tag-detail': () => import('./tag-detail.client').then(({ initTagDetailPage }) => initTagDetailPage),
};

function getCurrentPageId(): PageEnhancementId | undefined {
	const pageId = document.body.dataset.pageId;
	if (!pageId) return undefined;
	if (pageId in loaders) {
		return pageId as PageEnhancementId;
	}
	return undefined;
}

export async function runCurrentPageEnhancements() {
	cleanupParallax();
	const pageId = getCurrentPageId();
	if (!pageId) return;
	const handler = await loaders[pageId]();
	if (getCurrentPageId() !== pageId) return;
	handler();
}

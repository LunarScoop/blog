import type { BlogPost } from './blog';
import type { Project } from './projects';

export type ArticleCalendarSource = 'blog' | 'projects';

export interface ArticleCalendarEntry {
	dateKey: string;
	group: string;
	id: string;
	source: ArticleCalendarSource;
	title: string;
	url: string;
}

export interface ArticleCalendarDay {
	count: number;
	dateKey: string;
	dateLabel: string;
	entries: ArticleCalendarEntry[];
	level: 0 | 1 | 2 | 3 | 4;
	tooltip: string;
	weekIndex: number;
	weekdayIndex: number;
}

export interface ArticleCalendarMonthLabel {
	label: string;
	weekIndex: number;
}

export interface ArticleCalendarYear {
	days: ArticleCalendarDay[];
	monthLabels: ArticleCalendarMonthLabel[];
	total: number;
	weekCount: number;
	year: number;
}

export interface ArticleCalendarModel {
	defaultYear: number;
	years: ArticleCalendarYear[];
}

interface ArticleCalendarModelOptions {
	locale: string;
	now?: Date;
	timeZone: string;
}

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function formatUtcDateKey(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function getDateKeyParts(dateKey: string): [number, number, number] {
	const [year, month, day] = dateKey.split('-').map(Number);
	return [year, month, day];
}

function formatCalendarDate(dateKey: string, locale: string): string {
	const [year, month, day] = getDateKeyParts(dateKey);
	const date = new Date(Date.UTC(year, month - 1, day, 12));
	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'long',
		timeZone: 'UTC',
		year: 'numeric',
	}).format(date);
}

function titleizePathSegment(segment: string): string {
	let decodedSegment = segment;
	try {
		decodedSegment = decodeURIComponent(segment);
	} catch {
		decodedSegment = segment;
	}

	return decodedSegment
		.split(/[-_]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function getBlogGroup(post: BlogPost): string {
	const category = post.data.categories[0]?.trim();
	if (category) return category;

	const pathSegments = post.id.split('/').filter(Boolean);
	if (pathSegments.length > 1) return titleizePathSegment(pathSegments[0]);
	return 'Blog';
}

export function getDateKey(date: Date, timeZone: string): string {
	const parts = new Intl.DateTimeFormat('en-CA', {
		day: '2-digit',
		month: '2-digit',
		timeZone,
		year: 'numeric',
	}).formatToParts(date);
	const partMap = new Map(parts.map((part) => [part.type, part.value]));
	return `${partMap.get('year')}-${partMap.get('month')}-${partMap.get('day')}`;
}

export function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
	if (count <= 0) return 0;
	if (count >= 4) return 4;
	return count as 1 | 2 | 3;
}

export function isLeapYear(year: number): boolean {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function createArticleCalendarEntries(
	posts: BlogPost[],
	projects: Project[],
	timeZone: string,
): ArticleCalendarEntry[] {
	const blogEntries: ArticleCalendarEntry[] = posts.map((post) => ({
		dateKey: getDateKey(post.data.pubDate, timeZone),
		group: getBlogGroup(post),
		id: `blog:${post.id}`,
		source: 'blog',
		title: post.data.title,
		url: `/blog/${post.id}/`,
	}));
	const projectEntries: ArticleCalendarEntry[] = projects.map((project) => ({
		dateKey: getDateKey(project.data.created, timeZone),
		group: 'Projects',
		id: `projects:${project.id}`,
		source: 'projects',
		title: project.data.title,
		url: `/projects/${project.id}/`,
	}));

	return [...blogEntries, ...projectEntries].sort((left, right) => {
		const dateComparison = right.dateKey.localeCompare(left.dateKey);
		return dateComparison || left.title.localeCompare(right.title);
	});
}

export function buildArticleCalendarYear(
	year: number,
	entries: ArticleCalendarEntry[],
	locale: string,
): ArticleCalendarYear {
	const entriesByDate = new Map<string, ArticleCalendarEntry[]>();
	const yearPrefix = `${year}-`;
	const yearEntries = entries.filter((entry) => entry.dateKey.startsWith(yearPrefix));

	for (const entry of yearEntries) {
		const dateEntries = entriesByDate.get(entry.dateKey) ?? [];
		dateEntries.push(entry);
		entriesByDate.set(entry.dateKey, dateEntries);
	}

	const januaryFirst = new Date(Date.UTC(year, 0, 1));
	const firstWeekday = januaryFirst.getUTCDay();
	const daysInYear = isLeapYear(year) ? 366 : 365;
	const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
	const days: ArticleCalendarDay[] = [];

	for (let dayIndex = 0; dayIndex < daysInYear; dayIndex += 1) {
		const date = new Date(Date.UTC(year, 0, dayIndex + 1));
		const dateKey = formatUtcDateKey(date);
		const dayEntries = entriesByDate.get(dateKey) ?? [];
		const count = dayEntries.length;
		const dateLabel = formatCalendarDate(dateKey, locale);

		days.push({
			count,
			dateKey,
			dateLabel,
			entries: dayEntries,
			level: getActivityLevel(count),
			tooltip: `${dateLabel}\n${count} 篇内容`,
			weekIndex: Math.floor((firstWeekday + dayIndex) / 7),
			weekdayIndex: date.getUTCDay(),
		});
	}

	const monthLabels: ArticleCalendarMonthLabel[] = Array.from({ length: 12 }, (_, month) => {
		const monthStart = new Date(Date.UTC(year, month, 1));
		const dayIndex = Math.round((monthStart.valueOf() - januaryFirst.valueOf()) / DAY_IN_MILLISECONDS);
		return {
			label: monthFormatter.format(monthStart),
			weekIndex: Math.floor((firstWeekday + dayIndex) / 7),
		};
	});

	return {
		days,
		monthLabels,
		total: yearEntries.length,
		weekCount: Math.ceil((firstWeekday + daysInYear) / 7),
		year,
	};
}

export function buildArticleCalendarModel(
	entries: ArticleCalendarEntry[],
	options: ArticleCalendarModelOptions,
): ArticleCalendarModel {
	const now = options.now ?? new Date();
	const currentYear = Number(getDateKey(now, options.timeZone).slice(0, 4));
	const availableYears = new Set<number>([
		currentYear,
		...entries.map((entry) => Number(entry.dateKey.slice(0, 4))),
	]);
	const yearNumbers = [...availableYears].sort((left, right) => right - left);

	return {
		defaultYear: currentYear,
		years: yearNumbers.map((year) => buildArticleCalendarYear(year, entries, options.locale)),
	};
}

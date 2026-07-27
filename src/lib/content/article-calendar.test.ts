import { describe, expect, it } from 'vitest';
import {
	buildArticleCalendarModel,
	buildArticleCalendarYear,
	getActivityLevel,
	getDateKey,
	isLeapYear,
	type ArticleCalendarEntry,
} from './article-calendar';

const timeZone = 'Asia/Shanghai';

function createEntry(dateKey: string, id = dateKey): ArticleCalendarEntry {
	return {
		dateKey,
		group: 'Blog',
		id,
		source: 'blog',
		title: `Post ${id}`,
		url: `/blog/${id}/`,
	};
}

describe('article calendar date handling', () => {
	it('keeps date-only frontmatter on the same calendar date', () => {
		expect(getDateKey(new Date('2026-07-27'), timeZone)).toBe('2026-07-27');
	});

	it('uses the configured site timezone instead of the build machine timezone', () => {
		expect(getDateKey(new Date('2026-07-26T16:00:00.000Z'), timeZone)).toBe('2026-07-27');
	});

	it('handles Gregorian leap-year rules', () => {
		expect(isLeapYear(2024)).toBe(true);
		expect(isLeapYear(2100)).toBe(false);
		expect(isLeapYear(2000)).toBe(true);
	});
});

describe('article calendar activity levels', () => {
	it.each([
		[0, 0],
		[1, 1],
		[2, 2],
		[3, 3],
		[4, 4],
		[8, 4],
	] as const)('maps %i entries to level %i', (count, level) => {
		expect(getActivityLevel(count)).toBe(level);
	});
});

describe('article calendar year model', () => {
	it('renders every date in leap and non-leap years', () => {
		expect(buildArticleCalendarYear(2024, [], 'zh-CN').days).toHaveLength(366);
		expect(buildArticleCalendarYear(2026, [], 'zh-CN').days).toHaveLength(365);
	});

	it('places the first and last dates in their real weekday rows', () => {
		const calendar = buildArticleCalendarYear(2026, [], 'zh-CN');
		expect(calendar.days[0]).toMatchObject({ dateKey: '2026-01-01', weekdayIndex: 4 });
		expect(calendar.days.at(-1)).toMatchObject({ dateKey: '2026-12-31', weekdayIndex: 4 });
	});

	it('counts entries per date and retains the current year in the year switcher', () => {
		const entries = [
			createEntry('2025-12-31', 'older'),
			createEntry('2026-07-27', 'one'),
			createEntry('2026-07-27', 'two'),
		];
		const model = buildArticleCalendarModel(entries, {
			locale: 'zh-CN',
			now: new Date('2026-08-01T00:00:00+08:00'),
			timeZone,
		});

		expect(model.defaultYear).toBe(2026);
		expect(model.years.map((year) => year.year)).toEqual([2026, 2025]);
		expect(model.years[0].days.find((day) => day.dateKey === '2026-07-27')).toMatchObject({
			count: 2,
			level: 2,
		});
	});
});

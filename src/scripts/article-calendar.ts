function hideTooltip(tooltip: HTMLElement) {
	tooltip.hidden = true;
	tooltip.textContent = '';
}

function showTooltip(root: HTMLElement, cell: HTMLElement, tooltip: HTMLElement) {
	const content = cell.dataset.calendarTooltip;
	if (!content) return;

	const rootRect = root.getBoundingClientRect();
	const cellRect = cell.getBoundingClientRect();
	tooltip.textContent = content;
	tooltip.style.left = `${cellRect.left - rootRect.left + cellRect.width / 2}px`;
	tooltip.style.top = `${cellRect.top - rootRect.top}px`;
	tooltip.hidden = false;
}

function clearSelection(root: HTMLElement) {
	root.querySelectorAll<HTMLButtonElement>('button[data-calendar-date]').forEach((button) => {
		button.setAttribute('aria-pressed', 'false');
	});
	root.querySelectorAll<HTMLElement>('[data-calendar-details]').forEach((details) => {
		details.hidden = true;
	});
	const selection = root.querySelector<HTMLElement>('[data-calendar-selection]');
	if (selection) selection.hidden = true;
}

function showYear(root: HTMLElement, year: string) {
	const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-calendar-year-panel]'));
	const activePanel = panels.find((panel) => panel.dataset.year === year);
	for (const panel of panels) panel.hidden = panel !== activePanel;

	const summary = root.querySelector<HTMLElement>('[data-calendar-summary]');
	if (summary) summary.textContent = `${year} · ${activePanel?.dataset.total ?? '0'} 篇内容`;
	clearSelection(root);
}

function selectDate(root: HTMLElement, button: HTMLButtonElement) {
	const dateKey = button.dataset.calendarDate;
	if (!dateKey) return;

	root.querySelectorAll<HTMLButtonElement>('button[data-calendar-date]').forEach((dateButton) => {
		dateButton.setAttribute('aria-pressed', String(dateButton === button));
	});

	const details = Array.from(root.querySelectorAll<HTMLElement>('[data-calendar-details]'));
	const activeDetails = details.find((item) => item.dataset.calendarDate === dateKey);
	for (const item of details) item.hidden = item !== activeDetails;

	const selection = root.querySelector<HTMLElement>('[data-calendar-selection]');
	if (selection) selection.hidden = !activeDetails;
}

function initializeCalendar(root: HTMLElement) {
	if (root.dataset.calendarInitialized === 'true') return;
	root.dataset.calendarInitialized = 'true';

	const tooltip = root.querySelector<HTMLElement>('[data-calendar-tooltip-box]');
	const viewport = root.querySelector<HTMLElement>('[data-calendar-viewport]');
	const yearSelect = root.querySelector<HTMLSelectElement>('[data-calendar-year-select]');

	yearSelect?.addEventListener('change', () => showYear(root, yearSelect.value));
	root.addEventListener('click', (event) => {
		const button = event.target instanceof Element
			? event.target.closest<HTMLButtonElement>('button[data-calendar-date]')
			: null;
		if (button && root.contains(button)) selectDate(root, button);
	});

	if (!tooltip) return;
	root.querySelectorAll<HTMLElement>('[data-calendar-cell]').forEach((cell) => {
		cell.addEventListener('pointerenter', () => showTooltip(root, cell, tooltip));
		cell.addEventListener('pointerleave', () => hideTooltip(tooltip));
		cell.addEventListener('focus', () => showTooltip(root, cell, tooltip));
		cell.addEventListener('blur', () => hideTooltip(tooltip));
	});
	viewport?.addEventListener('scroll', () => hideTooltip(tooltip), { passive: true });
}

export function initArticleCalendars() {
	document.querySelectorAll<HTMLElement>('[data-article-calendar]').forEach(initializeCalendar);
}

// Run against pnpm preview, using an installed Playwright module (not a production dependency).
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.EXPERIMENT_BASE_URL || 'http://127.0.0.1:4321';
const output = process.env.EXPERIMENT_TEST_OUTPUT || 'tmp_pdf/viewsrd-browser';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
const errors = [];
const checks = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'reduce', acceptDownloads: true });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) errors.push(message.text()); });
const card = page.locator('experiment-chart[data-chart-id="viewsrd-nr3d"]');
const bar = () => card.locator('svg path[fill="#60a5fa"]').first();
try {
  const articleURL = '/blog/viewsrd-3d-visual-grounding/';
  for (const route of ['/blog/', '/tags/', '/tags/Paper%20Reading/', '/tags/3D%20Visual%20Grounding/']) {
    await page.goto(`${base}${route}`);
    const listing = page.locator('article').filter({has:page.locator(`a[href="${articleURL}"]`)}).first();
    const excerpt = await listing.locator('.blog-post-excerpt,.tag-post-excerpt').textContent();
    assert.match(excerpt,/^三维视觉定位/);
    assert.doesNotMatch(excerpt,/import |export |\.astro|results\.charts/);
    if(route==='/blog/') {
      await listing.scrollIntoViewIfNeeded();
      await page.waitForFunction(href=>{
        const link=[...document.querySelectorAll('article a')].find(el=>el.getAttribute('href')===href);
        if(!link) return false;
        for(let el=link.closest('article');el;el=el.parentElement) if(Number(getComputedStyle(el).opacity)<0.99) return false;
        return true;
      },articleURL);
      await listing.screenshot({path:`${output}/blog-excerpt-fixed.png`});
    }
  }
  const response = await page.request.get(`${base}/search-index.json`);
  const searchDoc = (await response.json()).find(doc=>doc.id==='viewsrd-3d-visual-grounding');
  assert.match(searchDoc.excerpt,/^三维视觉定位/);
  assert.ok(searchDoc.blocks.every(block=>!/^import |^export |results\.charts|\.\/\.\.\/components/.test(block.text)));
  checks.push('blog and tag excerpts + search index contain prose, without MDX source');
  await page.goto(`${base}/experiments/`);
  await page.waitForFunction(() => [...document.querySelectorAll('experiment-chart')].every(el => el.dataset.ready === 'true'));
  assert.equal(await page.locator('experiment-chart').count(), 5);
  await card.scrollIntoViewIfNeeded();
  await bar().hover();
  await page.waitForTimeout(100);
  assert.equal(await card.locator('.experiment__tooltip').isVisible(), true);
  assert.match(await card.locator('[data-tip-text]').textContent(), /MiKASA/);
  assert.match(await card.locator('[data-tip-text]').textContent(), /64\.4%/);
  assert.ok(await card.locator('svg path[fill-opacity="0.22"]').count() > 0, 'Other bars should visibly dim');
  checks.push('desktop hover: exact experiment/method/value/unit; SVG opacity dimming');
  await bar().click();
  assert.equal(await card.getAttribute('data-pinned'), 'true');
  await page.mouse.move(5, 5);
  assert.equal(await card.locator('.experiment__tooltip').isVisible(), true);
  await bar().click();
  assert.equal(await card.getAttribute('data-pinned'), null);
  await bar().click();
  const box = await card.locator('.experiment__plot').boundingBox();
  await page.mouse.click(box.x + box.width - 5, box.y + 5);
  assert.equal(await card.getAttribute('data-pinned'), null);
  checks.push('click pin, pointer-leave persistence, same-point unpin, blank-chart unpin');
  await card.locator('.experiment__plot').focus();
  await page.keyboard.press('Home');
  assert.match(await card.locator('[data-tip-text]').textContent(), /64\.4%/);
  await page.keyboard.press('Enter');
  assert.equal(await card.getAttribute('data-pinned'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await card.getAttribute('data-pinned'), null);
  checks.push('keyboard Home/arrows/Enter/Escape');
  await card.locator('summary').click();
  assert.equal(await card.locator('tbody tr').count(), 5);
  assert.match(await card.locator('tbody').textContent(), /69\.9%/);
  await card.locator('summary').click();
  for (const format of ['svg', 'png']) {
    const downloaded = page.waitForEvent('download');
    await card.locator(`[data-export="${format}"]`).click();
    const download = await downloaded;
    await download.saveAs(`${output}/${download.suggestedFilename()}`);
    assert.equal(await download.failure(), null);
  }
  checks.push('SVG and PNG actual downloads');
  await card.screenshot({ path: `${output}/desktop-dark.png` });
  await page.locator('#theme-toggle').click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await page.waitForTimeout(300);
  assert.equal(await card.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(245, 248, 252)');
  assert.equal(await card.locator('svg rect').first().getAttribute('fill'), '#f5f8fc');
  await card.screenshot({ path: `${output}/desktop-light.png` });
  checks.push('site theme button updates card and SVG');
  const heat = page.locator('experiment-chart[data-chart-id="viewsrd-view-matrix"]');
  await heat.scrollIntoViewIfNeeded();
  await heat.locator('.experiment__plot').focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  assert.match(await heat.locator('[data-tip-text]').textContent(), /缺失/);
  await page.keyboard.press('Escape');
  await heat.screenshot({ path: `${output}/heatmap.png` });
  const heatCell = heat.locator('svg text').filter({ hasText: /^69\.9%$/ }).first();
  await heatCell.hover();
  assert.match(await heat.locator('[data-tip-text]').textContent(), /69\.9%/);
  await heatCell.click();
  assert.equal(await heat.getAttribute('data-pinned'), 'true');
  await page.keyboard.press('Escape');
  checks.push('sparse heatmap and keyboard missing values');
  await page.locator('a[href="/blog/viewsrd-3d-visual-grounding/"]').first().click();
  await page.waitForURL('**/blog/viewsrd-3d-visual-grounding/');
  await page.waitForFunction(() => document.querySelectorAll('experiment-chart[data-ready="true"]').length === 8);
  await page.setViewportSize({width:1080,height:772});
  assert.ok(await page.locator('.katex').count() > 10);
  const renderedIDs = await page.locator('.prose [data-search-block]').evaluateAll(els=>els.map(el=>el.getAttribute('data-search-block')));
  const introBlock = searchDoc.blocks.find(block=>block.text.startsWith('三维视觉定位'));
  assert.ok(renderedIDs.includes(introBlock.id), 'The MDX introduction search result should resolve to its rendered paragraph');
  // Check actual production MDX rendering, not only source syntax or chart hydration.
  const source = await readFile('src/content/blog/viewsrd-3d-visual-grounding.mdx', 'utf8');
  const expectedTables = source.match(/(?:^\|[^\n]*\|[ \t]*\r?\n)+/gm).map(table => table.trim().split(/\r?\n/).filter((_,i)=>i!==1).map(row=>row.trim().slice(1,-1).split('|').map(cell=>cell.trim())));
  const tables = page.locator('.prose > .markdown-table-scroll > table');
  assert.equal(await tables.count(), expectedTables.length);
  assert.equal(expectedTables.length, 6);
  for (let i=0;i<expectedTables.length;i++) {
    const rows = tables.nth(i).locator('tr');
    assert.equal(await rows.count(), expectedTables[i].length);
    for (let j=0;j<expectedTables[i].length;j++) {
      const actual = await rows.nth(j).locator('th,td').evaluateAll(cells=>cells.map(cell=>{
        const copy=cell.cloneNode(true);
        copy.querySelectorAll('.katex-mathml').forEach(el=>el.remove());
        return copy.textContent.replace(/[\s\u200b-\u200d\ufeff]+/g,'');
      }));
      assert.equal(actual.length, expectedTables[i][j].length);
      for (let k=0;k<actual.length;k++) {
        const expected = expectedTables[i][j][k].replace(/\$S_\{\\mathrm\{consist\}\}\$/g,'Sconsist').replace(/\$S_\{\\mathrm\{similar\}\}\$/g,'Ssimilar').replace(/\$\\mathrm\{Clas\}\$/g,'Clas').replace(/\$([^$]+)\$/g,'$1').replace(/\s+/g,'');
        assert.equal(actual[k], expected, `Table ${i+1}, row ${j+1}, cell ${k+1}`);
      }
    }
  }
  assert.deepEqual(await page.locator('.prose p,.prose li').evaluateAll(els=>els.map(el=>el.textContent).filter(t=>t.includes('**')||/^\|/.test(t))), []);
  assert.equal(await page.locator('.katex-error').count(),0);
  assert.equal(await page.locator('.prose [data-export],.prose [data-clear]').count(),0);
  assert.equal(await page.locator('.prose p').filter({hasText:'论文正文将 Overall 增益写为 5.2%'}).count(),1);
  assert.equal(await page.locator('.prose p').filter({hasText:'这里沿用正文的'}).count(),1);
  assert.equal(await page.locator('.prose em').filter({hasText:/^图1：不同视角下的关系示意图$/}).count(),1);
  assert.equal(await page.locator('.prose em').filter({hasText:/^图 2：ViewSRD 整体结构。$/}).count(),1);
  const articleText = await page.locator('.prose').innerText();
  for (const removed of ['这里需要避免把研究动机', '两种协议的数值不能混为', '这是作者提出 SRD 的动机', '依据用户提供的视角示意图重绘', '使用本次提供的截图', '论文中的多视角来自三维场景', '文章日期按本次阅读记录']) {
    assert.ok(!articleText.includes(removed), `Removed editorial wording must stay absent: ${removed}`);
  }
  for (let i=0;i<await tables.count();i++) {
    await tables.nth(i).scrollIntoViewIfNeeded();
    await tables.nth(i).screenshot({path:`${output}/article-table-${i+1}-1080.png`});
  }
  for (const img of await page.locator('.prose img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(el=>el.decode());
    assert.ok(await img.evaluate(el=>el.naturalWidth)>0);
  }
  await page.locator('.prose p').filter({hasText:'正文式（2）对视角表示加权'}).screenshot({path:`${output}/view-weight-note.png`});
  const viewpoint = page.locator('.viewpoint-comparison');
  assert.equal(await viewpoint.locator('figure').count(),2);
  const figures = await viewpoint.locator('figure').evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})));
  assert.equal(figures[0].y,figures[1].y);
  assert.ok(figures[1].x>figures[0].x);
  const loss = tables.nth(3);
  await loss.scrollIntoViewIfNeeded();
  await loss.screenshot({path:`${output}/loss-table-fixed.png`});
  await page.locator('.prose p').filter({hasText:'论文正文将 Overall 增益写为 5.2%'}).screenshot({path:`${output}/numeric-note-fixed.png`});
  checks.push('all 6 MDX tables: every cell matches source; no raw Markdown or KaTeX errors; no article toolbar');
  const article = page.locator('experiment-chart').first();
  await article.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const el = document.querySelector('.content-card');
    return !el || getComputedStyle(el).opacity === '1';
  });
  await article.locator('svg path[fill="#60a5fa"]').first().hover();
  assert.equal(await article.locator('.experiment__tooltip').isVisible(), true);
  await article.screenshot({ path: `${output}/article-chart.png` });
  await article.locator('svg path[fill="#60a5fa"]').first().click();
  assert.equal(await article.getAttribute('data-pinned'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await article.getAttribute('data-pinned'),null);
  await page.goBack();
  await page.waitForFunction(() => document.querySelectorAll('experiment-chart[data-ready="true"]').length === 5);
  assert.equal(await card.locator('.experiment__plot > div').count(), 1);
  checks.push('MDX article: 8 charts + KaTeX; client navigation back: no duplicate instance');
  await page.goto(`${base}/blog/mikasa-3d-visual-grounding/`);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.content-card')).opacity === '1');
  assert.ok(await page.locator('.prose').innerText());
  checks.push('existing MiKASA article stays visible with reduced motion');
  await page.goto(`${base}/experiments/embed/viewsrd-nr3d/`);
  await page.waitForFunction(() => document.querySelector('experiment-chart')?.getAttribute('data-ready') === 'true');
  checks.push('standalone Markdown embed route renders');
  await page.goto(`${base}/experiments/`);
  await page.evaluate(() => {
    const iframe = document.createElement('iframe');
    iframe.src = '/experiments/embed/viewsrd-nr3d/';
    iframe.title = 'Markdown integration test';
    iframe.id = 'test-embed';
    iframe.style.cssText = 'width:100%;height:900px;border:0';
    document.querySelector('main').append(iframe);
  });
  const embedded = page.frameLocator('#test-embed');
  await embedded.locator('experiment-chart[data-ready="true"]').waitFor();
  await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
  await page.waitForTimeout(100);
  assert.equal(await embedded.locator('html').getAttribute('data-theme'), 'dark');
  await page.evaluate(() => document.documentElement.dataset.theme = 'light');
  await page.waitForTimeout(100);
  assert.equal(await embedded.locator('html').getAttribute('data-theme'), 'light');
  checks.push('Markdown iframe follows parent theme');

  for (const width of [390, 768]) {
    const mobileContext = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: true, isMobile: true, colorScheme: 'dark', reducedMotion: 'reduce' });
    const mobile = await mobileContext.newPage();
    mobile.on('pageerror', error => errors.push(error.message));
    mobile.on('console', message => { if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) errors.push(message.text()); });
    await mobile.goto(`${base}/experiments/`);
    await mobile.waitForFunction(() => document.querySelectorAll('experiment-chart[data-ready="true"]').length === 5);
    const mCard = mobile.locator('experiment-chart').first();
    await mCard.scrollIntoViewIfNeeded();
    const mBar = mCard.locator('svg path[fill="#60a5fa"]').first();
    await mBar.tap();
    assert.equal(await mCard.getAttribute('data-pinned'), 'true');
    assert.match(await mCard.locator('[data-tip-text]').textContent(), /64\.4%/);
    await mBar.tap();
    assert.equal(await mCard.getAttribute('data-pinned'), null);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    assert.equal(await mCard.evaluate(el => el.scrollWidth <= el.clientWidth), true);
    await mCard.screenshot({ path: `${output}/touch-${width}.png` });
    if (width === 390) {
      const downloaded = mobile.waitForEvent('download');
      await mCard.locator('[data-export="png"]').click();
      const download = await downloaded;
      await download.saveAs(`${output}/mobile-export.png`);
      assert.equal(await download.failure(), null);
    }
    await mobile.goto(`${base}/blog/viewsrd-3d-visual-grounding/`);
    await mobile.waitForFunction(() => document.querySelectorAll('experiment-chart[data-ready="true"]').length === 8);
    assert.equal(await mobile.locator('.content-card').evaluate(el=>getComputedStyle(el).opacity), '1');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    const wideTable = mobile.locator('.prose > .markdown-table-scroll').last();
    await wideTable.scrollIntoViewIfNeeded();
    if(width===390) {
      assert.equal(await wideTable.evaluate(el=>el.scrollWidth>el.clientWidth),true);
      await wideTable.evaluate(el=>el.scrollLeft=el.scrollWidth);
      assert.ok(await wideTable.evaluate(el=>el.scrollLeft)>0);
    }
    await wideTable.screenshot({path:`${output}/comparison-table-${width}.png`});
    assert.equal(await mobile.locator('.prose [data-export],.prose [data-clear]').count(),0);
    if (width === 390) {
      for (const id of ['viewsrd-ablation', 'viewsrd-views', 'viewsrd-weights']) {
        const item = mobile.locator(`experiment-chart[data-chart-id="${id}"]`);
        await item.scrollIntoViewIfNeeded();
        await item.screenshot({path:`${output}/mobile-${id}.png`});
        if (id === 'viewsrd-weights') assert.ok(await item.locator('svg text').filter({hasText:/^0\.25$/}).count());
      }
    }
    checks.push(`${width}px touch: pin/unpin, dashboard and article without horizontal overflow`);
    await mobileContext.close();
  }
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJS.newPage();
  await fallback.goto(`${base}/experiments/embed/viewsrd-nr3d/`);
  await fallback.locator('summary').click();
  assert.match(await fallback.locator('tbody').textContent(), /69\.9%/);
  await noJS.close();
  checks.push('JavaScript disabled: SSR data table readable');
  assert.deepEqual(errors, []);
  checks.push('no browser page errors');
  await writeFile(`${output}/report.json`, JSON.stringify({ base, checks, errors }, null, 2), 'utf8');
  console.log(JSON.stringify({ checks, errors }, null, 2));
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` });
  console.error('Browser errors:', errors);
  throw error;
} finally { await browser.close(); }

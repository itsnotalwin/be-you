import {test, expect} from '@playwright/test';

const storageKey = 'beyou-v1-local-data';
const cleanData = () => ({
  version: 1, onboarded: true, checkins: [], journal: [], journeys: {},
  favorites: [], settings: {light: false, reduceMotion: false, largeText: false}
});
const baselineRoutes = [
  'welcome', 'onboard-notice', 'onboard-grow', 'today', 'home',
  'mood', 'mood-details', 'mood-saved', 'journal', 'journal-edit',
  'heal', 'journey-detail', 'exercise', 'journey-complete',
  'insights', 'affirmations', 'breathe', 'you', 'settings', 'offline', 'install'
];
const moodSources = [
  ['happy', '01-good.webp'], ['calm', '02-calm.webp'],
  ['neutral', '03-okay.webp'], ['anxious', '04-anxious.webp'],
  ['sad', '05-low.webp']
];

async function visit(page, route) {
  await page.goto('?screen=' + encodeURIComponent(route));
  await expect(page.locator('.device')).toHaveAttribute('data-page', route);
  await expect(page.locator('#app')).not.toBeEmpty();
}
async function requireImages(page) {
  await expect.poll(
    () => page.locator('#app img').evaluateAll(
      images => images.every(image => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)
    ), {timeout: 15000, message: 'Every illustrated screen image must load successfully'}
  ).toBe(true);
}
async function capture(page, testInfo, name) {
  if (process.env.PLAYWRIGHT_CAPTURE !== '1') return;
  const path = testInfo.outputPath(name + '.png');
  await page.screenshot({path, animations: 'disabled'});
  await testInfo.attach(name, {path, contentType: 'image/png'});
}

test.beforeEach(async ({page}) => {
  // Each test has its own isolated browser context. Never touch real user data.
  await page.addInitScript(({key, value}) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
  }, {key: storageKey, value: JSON.stringify(cleanData())});
});

test('all approved routes render with real artwork and screenshot evidence', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of baselineRoutes) {
    await visit(page, route);
    await requireImages(page);
    await capture(page, testInfo, 'screen-' + route);
  }
  // The remaining baseline states are data-dependent, not fake extra routes.
  const populated = cleanData();
  populated.journal.push({
    id: 'visual-test-entry', title: 'Test reflection', body: 'Only synthetic test words.',
    createdAt: Date.now(), updatedAt: Date.now()
  });
  await page.evaluate(([key, value]) => localStorage.setItem(key, value),
    [storageKey, JSON.stringify(populated)]);
  await visit(page, 'journal');
  await requireImages(page);
  await capture(page, testInfo, 'screen-journal-populated');
  await page.locator('[data-view="visual-test-entry"]').click();
  await expect(page.locator('.device')).toHaveAttribute('data-page', 'journal-view');
  await requireImages(page);
  await capture(page, testInfo, 'screen-journal-view');
  expect(errors, 'Uncaught browser errors').toEqual([]);
});

test('one reactive mood screen changes all five stable full-bleed portraits', async ({page}, testInfo) => {
  await visit(page, 'mood');
  const portrait = page.locator('#mood-portrait');
  const panel = page.locator('.mood-v2');
  const originalUrl = page.url();
  const sources = new Set();
  let firstFrame = null;
  for (const [mood, filename] of moodSources) {
    await page.locator('.mood-v2-options [data-mood="' + mood + '"]').click();
    await expect(panel).toHaveAttribute('data-selected-mood', mood);
    await expect(page.locator('.mood-v2-options [aria-pressed="true"]')).toHaveCount(1);
    await expect(portrait).toHaveAttribute('src', new RegExp(filename.replace('.', '\\.') + '$'));
    await requireImages(page);
    const measurement = await portrait.evaluate(image => {
      const imageBox = image.getBoundingClientRect();
      const frame = image.parentElement.getBoundingClientRect();
      const css = getComputedStyle(image);
      return {
        source: image.getAttribute('src'),
        naturalRatio: image.naturalWidth / image.naturalHeight,
        frameRatio: frame.width / frame.height,
        frameWidth: frame.width,
        frameHeight: frame.height,
        renderedWidth: imageBox.width,
        renderedHeight: imageBox.height,
        objectFit: css.objectFit
      };
    });
    sources.add(measurement.source);
    // Tiny (<6%) centered crop keeps each approved image full-bleed without stretching.
    expect(measurement.objectFit).toBe('cover');
    expect(Math.abs(measurement.frameRatio - 306 / 562)).toBeLessThan(0.01);
    expect(Math.abs(measurement.frameHeight - measurement.renderedHeight)).toBeLessThan(4);
    expect(Math.abs(measurement.frameWidth - measurement.renderedWidth)).toBeLessThan(4);
    expect(Math.max(0, 1 - measurement.naturalRatio / (306 / 562))).toBeLessThan(0.06);
    if (firstFrame) {
      expect(Math.abs(measurement.frameWidth - firstFrame.frameWidth)).toBeLessThan(1);
      expect(Math.abs(measurement.frameHeight - firstFrame.frameHeight)).toBeLessThan(1);
    } else firstFrame = measurement;
    expect(page.url()).toBe(originalUrl);
    await expect(portrait).toHaveCount(1);
    await portrait.scrollIntoViewIfNeeded();
    await capture(page, testInfo, 'mood-' + mood + '-portrait');
    await page.locator('.mood-v2-options [data-mood="' + mood + '"]').scrollIntoViewIfNeeded();
    await capture(page, testInfo, 'mood-' + mood + '-choices');
  }
  expect(sources.size).toBe(5);
  const data = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(data.checkins).toHaveLength(0);
});

test('desktop mood chooser shows the portrait alongside all five choices', async ({page}, testInfo) => {
  test.skip(!testInfo.project.name.includes('desktop'), 'Desktop-only responsive check');
  await visit(page, 'mood');
  await requireImages(page);
  const viewport=page.viewportSize();
  const portrait=await page.locator('.mood-v2-art').boundingBox();
  const choices=await page.locator('.mood-v2-options').boundingBox();
  const next=await page.locator('.mood-v2-next').boundingBox();
  expect(portrait, 'Art must be rendered').not.toBeNull();
  expect(choices, 'Choices must be rendered').not.toBeNull();
  expect(next, 'Continue must be rendered').not.toBeNull();
  expect(portrait.x + portrait.width).toBeLessThan(choices.x);
  expect(choices.y).toBeGreaterThanOrEqual(0);
  expect(choices.y + choices.height).toBeLessThan(viewport.height - 8);
  expect(next.y + next.height).toBeLessThan(viewport.height - 8);
  await page.locator('[data-mood="neutral"]').click();
  await expect(page.locator('.mood-v2')).toHaveAttribute('data-selected-mood', 'neutral');
  await expect(page.locator('.mood-v2-options [aria-pressed="true"]')).toHaveCount(1);
});

test('phone mood cards appear without needing to scroll past the illustration', async ({page}, testInfo) => {
  test.skip(testInfo.project.name.includes('desktop'), 'Phone-only discovery check');
  await visit(page, 'mood');
  await requireImages(page);
  const viewport = page.viewportSize();
  const buttons = await page.locator('.mood-v2-options [data-mood]').evaluateAll(elements =>
    elements.map(element => {
      const b = element.getBoundingClientRect();
      return {top:b.top, bottom:b.bottom, height:b.height};
    })
  );
  expect(buttons).toHaveLength(5);
  for (const [index, button] of buttons.entries()) {
    expect(button.top, 'Mood choice ' + index + ' starts on screen').toBeGreaterThan(0);
    expect(button.bottom, 'Mood choice ' + index + ' fits on first screen').toBeLessThanOrEqual(viewport.height - 8);
    expect(button.height, 'Mood choices remain comfortably touchable').toBeGreaterThanOrEqual(75);
  }
  if (viewport.height >= 800 && !testInfo.project.name.includes('desktop')) {
    const action = await page.locator('.mood-v2-next').boundingBox();
    expect(action, 'Continue button must exist').not.toBeNull();
    expect(action.y + action.height, 'Continue should fit in normal phone view').toBeLessThanOrEqual(viewport.height - 8);
  }
  const image = page.locator('#mood-portrait');
  const measures = await image.evaluate(img => {
    const frame = img.parentElement.getBoundingClientRect();
    const shown = img.getBoundingClientRect();
    return {
      sourceRatio: img.naturalWidth / img.naturalHeight,
      frameRatio: frame.width / frame.height,
      widthInset: frame.width - shown.width,
      heightInset: frame.height - shown.height,
      fit: getComputedStyle(img).objectFit
    };
  });
  expect(measures.fit).toBe('cover');
  expect(Math.abs(measures.frameRatio - 306 / 562)).toBeLessThan(0.01);
  expect(Math.abs(measures.widthInset)).toBeLessThan(4);
  expect(Math.abs(measures.heightInset)).toBeLessThan(4);
  expect(Math.max(0, 1 - measures.sourceRatio / (306 / 562))).toBeLessThan(0.06);
  await page.locator('[data-mood="sad"]').click();
  await expect(page.locator('.mood-v2')).toHaveAttribute('data-selected-mood', 'sad');
  await expect(page.locator('#mood-portrait')).toHaveAttribute('src', /05-low[.]webp$/);
  await requireImages(page);
});

test('mood check-in persists only after Save', async ({page}) => {
  await visit(page, 'mood');
  await page.locator('[data-mood="happy"]').click();
  await page.locator('[data-screen="mood-details"]').click();
  await expect(page.locator('.device')).toHaveAttribute('data-page', 'mood-details');
  await page.locator('#mood-note').fill('A browser test moment');
  let data = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(data.checkins).toHaveLength(0);
  await page.locator('[data-action="save-mood"]').click();
  await expect(page.locator('.device')).toHaveAttribute('data-page', 'mood-saved');
  data = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(data.checkins).toHaveLength(1);
  expect(data.checkins[0].mood).toBe('happy');
  expect(data.checkins[0].note).toBe('A browser test moment');
  await page.reload();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).checkins.length, storageKey)).toBe(1);
});

test('journal writing saves and reopens with browser storage', async ({page}) => {
  await visit(page, 'journal');
  await page.locator('[data-action="new-journal"]').first().click();
  await expect(page.locator('.device')).toHaveAttribute('data-page', 'journal-edit');
  await page.locator('#journal-title').fill('QA reflection');
  await page.locator('#journal-body').fill('Only synthetic browser test data.');
  await page.locator('[data-action="save-journal"]').click();
  await expect(page.locator('.device')).toHaveAttribute('data-page', 'journal');
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(stored.journal).toHaveLength(1);
  expect(stored.journal[0].title).toBe('QA reflection');
  await page.locator('[data-view]').first().click();
  await expect(page.locator('.device')).toHaveAttribute('data-page', 'journal-view');
  await expect(page.locator('.mock-entry-body')).toContainText('Only synthetic browser test data.');
});

test('navigation respects mobile footer and desktop sidebar', async ({page}, testInfo) => {
  await visit(page, 'today');
  const desktop = testInfo.project.name.includes('desktop');
  if (desktop) {
    await expect(page.locator('.desktop-sidebar')).toBeVisible();
    await expect(page.locator('.screenfooter')).toBeHidden();
    await page.locator('.desktop-sidebar [data-screen="journal"]').click();
  } else {
    await expect(page.locator('.desktop-sidebar')).toBeHidden();
    await expect(page.locator('.screenfooter')).toBeVisible();
    await page.locator('.screenfooter [data-screen="journal"]').click();
  }
  await expect(page.locator('.device')).toHaveAttribute('data-page', 'journal');
  // Layout checks are functional assertions, not a substitute for reviewed pixel baselines.
  const width = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth, viewport: innerWidth
  }));
  expect(width.document).toBeLessThanOrEqual(width.viewport + 2);
});

test('@live production serves the same interactive mood screen', async ({page}) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'Only run against explicit production URL');
  if (process.env.EXPECTED_SHA) {
    await expect.poll(async () => {
      const response = await page.request.get('release.json?check=' + Date.now(), {
        headers: {'Cache-Control': 'no-cache'}
      });
      if (!response.ok()) return 'release-unavailable';
      try {return (await response.json()).sha;} catch {return 'invalid-release';}
    }, {timeout: 120000, intervals: [2000, 4000, 8000]}).toBe(process.env.EXPECTED_SHA);
  }
  await visit(page, 'mood');
  await requireImages(page);
  await page.locator('[data-mood="anxious"]').click();
  await expect(page.locator('#mood-portrait')).toHaveAttribute('src', /04-anxious\.webp$/);
  await requireImages(page);
});

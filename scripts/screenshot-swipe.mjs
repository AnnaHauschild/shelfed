import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Captures the discover deck mid-swipe (dragging RIGHT) so the WATCHED stamp,
// dimmed poster and tilt are all visible. Size is controlled via the same env
// vars as screenshot.mjs so it can be added to every store folder.
const WIDTH = Number(process.env.SHOT_WIDTH ?? 430);
const HEIGHT = Number(process.env.SHOT_HEIGHT ?? 932);
const DPR = Number(process.env.SHOT_DPR ?? 3);
const OUT = process.env.SHOT_OUT ?? 'C:/Users/ahauschild/shelfed/store/screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: DPR,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();

async function clickCard(blurb) {
  const card = page
    .locator('div')
    .filter({ hasText: new RegExp(`^${blurb}$`) })
    .locator('xpath=ancestor-or-self::div[contains(@class,"r-cursor-1loqt21")][1]');
  await card.first().waitFor({ state: 'visible', timeout: 5000 });
  await card.first().click({ force: true });
}

await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);
await clickCard('Recall the films of a lifetime');
// Give the top card's poster art time to load before the drag.
await page.waitForTimeout(5000);

// react-native-gesture-handler listens for touch events on web, so drive the
// pan with real CDP touch events (Playwright's mouse API won't engage it).
const client = await context.newCDPSession(page);
const startX = WIDTH * 0.44;
const y = HEIGHT * 0.5;
const dragDist = WIDTH * 0.45;

await client.send('Input.dispatchTouchEvent', {
  type: 'touchStart',
  touchPoints: [{ x: startX, y }],
});
const steps = 16;
for (let i = 1; i <= steps; i++) {
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: startX + (dragDist * i) / steps, y }],
  });
  await page.waitForTimeout(16);
}
await page.waitForTimeout(600);
const out = join(OUT, '02b-swipe.png');
await page.screenshot({ path: out, fullPage: false });
console.log('saved', out);

// Drag back under the threshold, then lift, so nothing commits.
await client.send('Input.dispatchTouchEvent', {
  type: 'touchMove',
  touchPoints: [{ x: startX, y }],
});
await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

await browser.close();
console.log('done');

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Render at natural iPhone 6.9" logical size; DPR=3 -> 1290x2796 PNG (App Store compliant).
// Override via env vars to produce other sizes, e.g. a 9:16 set for Google Play.
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

async function shot(name, extraWait = 1200) {
  await page.waitForTimeout(extraWait);
  const out = join(OUT, `${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved', out);
}

async function clickCard(blurb) {
  const card = page
    .locator('div')
    .filter({ hasText: new RegExp(`^${blurb}$`) })
    .locator('xpath=ancestor-or-self::div[contains(@class,"r-cursor-1loqt21")][1]');
  await card.first().waitFor({ state: 'visible', timeout: 5000 });
  await card.first().click({ force: true });
}

async function goHome() {
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
}

async function openSearchTab() {
  const tab = page.getByText('Search', { exact: true }).first();
  await tab.waitFor({ state: 'visible', timeout: 5000 });
  await tab.click({ force: true });
  await page.waitForTimeout(1200);
}

async function typeQuery(text) {
  const input = page.locator('input').first();
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.click({ force: true });
  await input.fill('');
  await input.type(text, { delay: 40 });
  // Debounced search fires after 350ms; wait for results AND poster images.
  await page.waitForTimeout(4500);
}

// ---- 01 Landing ------------------------------------------------------------
await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);
await shot('01-landing');

// ---- 02 Movies discover deck + 03 Movie details (feature: The Sheep Detectives) ----
try {
  await clickCard('Recall the films of a lifetime');
  await page.waitForTimeout(4000);
  await shot('02-movies');

  // For the details screenshot, search a specific curated title so it's always
  // the same movie in the store listing.
  try {
    await openSearchTab();
    await typeQuery('Interstellar');
    // Click the title text of the first search result to open the details modal.
    const titleCell = page.getByText('INTERSTELLAR', { exact: false }).first();
    await titleCell.waitFor({ state: 'visible', timeout: 5000 });
    await titleCell.click({ force: true });
    await page.waitForTimeout(2500);
    await shot('03-movie-details');
  } catch (e) {
    console.log('interstellar search failed:', e.message);
  }
} catch (e) {
  console.log('movies flow failed:', e.message);
}

// ---- 04 Books (search "Sapiens" — guaranteed strong hero title) -----------
try {
  await goHome();
  await clickCard('Remember the books you have read');
  await page.waitForTimeout(3500);
  await openSearchTab();
  await typeQuery('Sapiens');
  await shot('04-books', 800);
} catch (e) {
  console.log('books flow failed:', e.message);
}

// ---- 05 Series (search "Breaking Bad" — prestige hero title) --------------
try {
  await goHome();
  await clickCard('Track the shows you have binged');
  await page.waitForTimeout(3500);
  await openSearchTab();
  await typeQuery('Breaking Bad');
  await shot('05-series', 800);
} catch (e) {
  console.log('series flow failed:', e.message);
}

await browser.close();
console.log('done');

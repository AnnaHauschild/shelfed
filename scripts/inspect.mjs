import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Find the tag chain around "Movies"
const info = await page.evaluate(() => {
  const walk = (el) => {
    const chain = [];
    let cur = el;
    while (cur && chain.length < 6) {
      chain.push({
        tag: cur.tagName,
        role: cur.getAttribute('role'),
        className: cur.className?.slice(0, 100),
        text: (cur.textContent || '').slice(0, 40),
      });
      cur = cur.parentElement;
    }
    return chain;
  };
  const nodes = Array.from(document.querySelectorAll('*')).filter(
    (el) => el.textContent?.trim() === 'Movies'
  );
  return nodes.map((n) => walk(n));
});
console.log(JSON.stringify(info, null, 2));

await browser.close();

// Optional development utility: render the project's vector icon to PWA PNGs.
const { chromium } = require(process.argv[2] || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage();
    for (const size of [192, 512]) {
      await page.setViewportSize({ width: size, height: size });
      await page.goto('http://localhost:4173/assets/icon.svg');
      await page.screenshot({ path: `frontend/assets/icon-${size}.png`, omitBackground: true });
    }
  } finally { await browser.close(); }
})();

import { chromium } from 'playwright';

const url = 'https://1drv.ms/x/c/b29a7352ce375c54/IQAVdpxYbazkTKu9A8B_1RULAfOdFQSSfz8JNN92trJyJm0?e=IiO5hF';

const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  locale: 'pt-PT',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'
});
const page = await context.newPage();
page.setDefaultTimeout(20000);

console.log('OPEN', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);

console.log('TITLE', await page.title());
console.log('URL', page.url());

const bodyText = await page.locator('body').innerText().catch(()=> '');
console.log('BODY_START');
console.log(bodyText.slice(0, 25000));
console.log('BODY_END');

const roles = await page.locator('[role]').evaluateAll((els) => els.slice(0, 600).map((el) => ({
  role: el.getAttribute('role'),
  text: (el.innerText || el.textContent || '').trim().slice(0,200),
  ariaRow: el.getAttribute('aria-rowindex'),
  ariaCol: el.getAttribute('aria-colindex'),
  ariaLabel: el.getAttribute('aria-label'),
  title: el.getAttribute('title')
})).filter(x => x.text || x.ariaLabel || x.title));
console.log('ROLES_START');
console.log(JSON.stringify(roles, null, 2).slice(0,50000));
console.log('ROLES_END');

await page.screenshot({ path: 'moura-2026/debug.png', fullPage: false });
await browser.close();

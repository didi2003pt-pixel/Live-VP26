import { chromium } from 'playwright';

const url = 'https://1drv.ms/x/c/b29a7352ce375c54/IQAVdpxYbazkTKu9A8B_1RULAfOdFQSSfz8JNN92trJyJm0?e=IiO5hF';

const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  locale: 'pt-PT',
  permissions: ['clipboard-read', 'clipboard-write'],
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'
});
const page = await context.newPage();
page.setDefaultTimeout(20000);

console.log('OPEN', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);

console.log('TITLE', await page.title());
console.log('URL', page.url());
console.log('FRAME_COUNT', page.frames().length);

let idx=0;
for (const frame of page.frames()) {
  let text='';
  let roles=[];
  try { text=(await frame.locator('body').innerText()).slice(0,12000); } catch {}
  try {
    roles=await frame.locator('[role]').evaluateAll((els)=>els.slice(0,800).map((el)=>({
      role:el.getAttribute('role'),
      text:(el.innerText||el.textContent||'').trim().slice(0,160),
      label:el.getAttribute('aria-label'),
      row:el.getAttribute('aria-rowindex'),
      col:el.getAttribute('aria-colindex'),
      title:el.getAttribute('title')
    })).filter(x=>x.text||x.label||x.title));
  } catch {}
  console.log('FRAME', idx++, frame.url());
  console.log('FRAME_TEXT_START');
  console.log(text);
  console.log('FRAME_TEXT_END');
  console.log('FRAME_ROLES_START');
  console.log(JSON.stringify(roles,null,2).slice(0,40000));
  console.log('FRAME_ROLES_END');
}

await page.screenshot({ path: 'moura-2026/debug.png', fullPage: false });
await browser.close();

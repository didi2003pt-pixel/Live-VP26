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
page.setDefaultTimeout(25000);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);

const excel = page.frames().find(f => f.url().includes('excel.officeapps.live.com'));
if (!excel) throw new Error('Excel frame not found');

async function copyRange(sheet, range) {
  await excel.getByRole('tab', { name: new RegExp('Folha de cálculo ' + sheet, 'i') }).click();
  await page.waitForTimeout(1200);
  const nameBox = excel.getByRole('combobox', { name: /Caixa de Nome/i });
  await nameBox.click();
  await nameBox.fill(range);
  await nameBox.press('Enter');
  await page.waitForTimeout(800);
  const grid = excel.getByRole('textbox', { name: 'grid' });
  await grid.focus();
  await grid.press('Control+c');
  await page.waitForTimeout(900);
  let clip='';
  try { clip = await excel.evaluate(() => navigator.clipboard.readText()); }
  catch (e) { clip = 'CLIPBOARD_ERROR: ' + String(e); }
  console.log('COPY_'+sheet+'_START');
  console.log(clip);
  console.log('COPY_'+sheet+'_END');
  return clip;
}

await copyRange('Sheet1','B1:D19');
await copyRange('Sheet2','B1:H19');
await page.screenshot({ path: 'moura-2026/debug.png', fullPage: false });
await browser.close();

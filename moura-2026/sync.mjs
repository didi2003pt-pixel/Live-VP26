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

async function copyRange(sheet, cols, rows) {
  await excel.getByRole('tab', { name: new RegExp('Folha de cálculo ' + sheet, 'i') }).click();
  await page.waitForTimeout(1000);
  const grid = excel.getByRole('textbox', { name: 'grid' });
  await grid.focus();
  await page.keyboard.press('Control+Home');
  await page.keyboard.press('ArrowRight'); // A1 -> B1
  for (let i=1;i<cols;i++) await page.keyboard.press('Shift+ArrowRight');
  for (let i=1;i<rows;i++) await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Control+c');
  await page.waitForTimeout(800);
  const clip = await excel.evaluate(() => navigator.clipboard.readText());
  console.log('COPY_'+sheet+'_START');
  console.log(clip);
  console.log('COPY_'+sheet+'_END');
  return clip;
}

await copyRange('Sheet1',3,19); // B1:D19
await copyRange('Sheet2',7,19); // B1:H19
await browser.close();

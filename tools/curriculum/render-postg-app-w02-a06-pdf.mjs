#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const outputDir = path.resolve(process.argv[2] ?? 'docs/curriculum/output/postg-app/w02-a06');
const jobs = [
  ['POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html', 'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf'],
  ['POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html', 'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf']
];
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });
  for (const [htmlName, pdfName] of jobs) {
    const htmlPath = path.join(outputDir, htmlName);
    const pdfPath = path.join(outputDir, pdfName);
    if (!fs.existsSync(htmlPath)) throw new Error(`HTML_NOT_FOUND:${htmlPath}`);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
  }
} finally {
  await browser.close();
}

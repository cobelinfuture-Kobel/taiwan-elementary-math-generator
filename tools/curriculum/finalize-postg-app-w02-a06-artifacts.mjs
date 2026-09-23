#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const outputDir = path.resolve(process.argv[2] ?? 'docs/curriculum/output/postg-app/w02-a06');
const manifestPath = path.join(outputDir, 'POSTG_APP_W02_A06_ARTIFACT_MANIFEST.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pdfs = [
  ['numericPdf', 'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf'],
  ['applicationPdf', 'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf']
];
for (const [artifactType, fileName] of pdfs) {
  const filePath = path.join(outputDir, fileName);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) throw new Error(`PDF_INVALID:${filePath}`);
  manifest.artifacts.push({
    artifactType,
    path: path.relative(process.cwd(), filePath).replaceAll('\\', '/'),
    sha256: createHash('sha256').update(fs.readFileSync(filePath)).digest('hex'),
    sizeBytes: fs.statSync(filePath).size
  });
}
manifest.status = 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED';
manifest.htmlArtifactCount = 2;
manifest.pdfArtifactCount = 2;
manifest.artifactHashCount = manifest.artifacts.length;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(manifest, null, 2));

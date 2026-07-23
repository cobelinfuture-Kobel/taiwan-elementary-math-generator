#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  materializeW02A06ProductionEquivalentPackage,
  validateW02A06ProductionEquivalentPackage
} from '../../src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs';

const outputDir = path.resolve(process.argv[2] ?? 'docs/curriculum/output/postg-app/w02-a06');
fs.mkdirSync(outputDir, { recursive: true });
const pkg = materializeW02A06ProductionEquivalentPackage();
const validation = validateW02A06ProductionEquivalentPackage(pkg);
if (!validation.ok) {
  console.error(JSON.stringify(validation, null, 2));
  process.exit(1);
}

const files = {
  numericHtml: path.join(outputDir, 'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html'),
  applicationHtml: path.join(outputDir, 'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html'),
  packageJson: path.join(outputDir, 'POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE.json')
};
fs.writeFileSync(files.numericHtml, pkg.numericHtml, 'utf8');
fs.writeFileSync(files.applicationHtml, pkg.applicationHtml, 'utf8');
fs.writeFileSync(files.packageJson, `${JSON.stringify({
  schemaVersion: 1,
  programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
  taskId: 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration',
  status: validation.status,
  counts: validation.counts,
  modeCounts: validation.modeCounts,
  familyCounts: validation.familyCounts,
  sourceCounts: validation.sourceCounts,
  generatedItems: pkg.generatedItems,
  pblTaskSetRecords: pkg.pblTaskSetRecords,
  numericWorksheetDocument: pkg.numericWorksheetResult.worksheetDocument,
  applicationWorksheetDocument: pkg.applicationWorksheetResult.worksheetDocument,
  productionBoundary: {
    productionSelectable: false,
    publicSelectable: false,
    publicUIChanged: false,
    productionAdmissionAllowed: false
  }
}, null, 2)}\n`, 'utf8');

const sha256 = (filePath) => createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const manifest = {
  schemaVersion: 1,
  programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
  taskId: 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration',
  status: 'HTML_ARTIFACTS_VERIFIED_PDF_PENDING',
  counts: validation.counts,
  artifacts: Object.entries(files).map(([artifactType, filePath]) => ({
    artifactType,
    path: path.relative(process.cwd(), filePath).replaceAll('\\', '/'),
    sha256: sha256(filePath),
    sizeBytes: fs.statSync(filePath).size
  })),
  nextShortestStep: 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage'
};
const manifestPath = path.join(outputDir, 'POSTG_APP_W02_A06_ARTIFACT_MANIFEST.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputDir, validation, manifestPath }, null, 2));

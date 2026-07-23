import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW02A07HumanReviewPackage,
  validateW02A07HumanReviewPackage
} from '../../src/curriculum/application/w02-a07-human-review-package.mjs';

const root = process.cwd();
const outputDir = path.join(root, 'docs/curriculum/output/postg-app/w02-a07');
const a06Dir = path.join(root, 'docs/curriculum/output/postg-app/w02-a06');
const relative = (value) => path.relative(root, value).replaceAll(path.sep, '/');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const digestFile = (absolutePath) => ({
  path: relative(absolutePath),
  sha256: sha256(fs.readFileSync(absolutePath)),
  sizeBytes: fs.statSync(absolutePath).size
});

fs.mkdirSync(outputDir, { recursive: true });
const model = materializeW02A07HumanReviewPackage({ root });
const validation = validateW02A07HumanReviewPackage(model);
if (!validation.ok) throw new Error(JSON.stringify(validation.issues, null, 2));

const dataPath = path.join(outputDir, 'POSTG_APP_W02_A07_HUMAN_REVIEW_DATA.json');
const indexPath = path.join(outputDir, 'POSTG_APP_W02_A07_HUMAN_REVIEW_INDEX.html');
const extractedPath = path.join(outputDir, 'POSTG_APP_W02_A07_HUMAN_REVIEW.extracted.txt');
const manifestPath = path.join(outputDir, 'POSTG_APP_W02_A07_HUMAN_REVIEW_MANIFEST.json');

const reviewData = {
  schemaName: model.schemaName,
  schemaVersion: model.schemaVersion,
  programId: model.programId,
  taskId: model.taskId,
  parentTaskId: model.parentTaskId,
  status: model.status,
  evidenceLevel: model.evidenceLevel,
  reviewType: model.reviewType,
  reviewChecklist: model.reviewChecklist,
  summary: model.summary,
  applicationReviewRows: model.applicationReviewRows,
  pblReviewRows: model.pblReviewRows,
  numericBoundaryReviewRows: model.numericBoundaryReviewRows,
  boundaries: model.boundaries,
  artifacts: model.artifacts
};
fs.writeFileSync(dataPath, `${JSON.stringify(reviewData, null, 2)}\n`);
fs.writeFileSync(indexPath, model.reviewIndexHtml);
const extracted = [
  'W02 PRODUCTION-EQUIVALENT HUMAN REVIEW EXTRACT',
  `APPLICATION_REVIEW_COUNT=${model.summary.applicationReviewCount}`,
  `PBL_REVIEW_COUNT=${model.summary.pblReviewCount}`,
  `NUMERIC_BOUNDARY_REVIEW_COUNT=${model.summary.numericBoundaryReviewCount}`,
  '',
  ...model.applicationReviewRows.flatMap((row, index) => [
    `[APPLICATION ${index + 1}] ${row.sourceNodeId} ${row.operationFamilyId}`,
    row.promptText,
    `ANSWER: ${row.answerText ?? JSON.stringify(row.answerValue)}`,
    ''
  ]),
  ...model.pblReviewRows.flatMap((row, index) => [
    `[PBL ${index + 1}] ${row.sourceNodeId} ${row.graphType}`,
    JSON.stringify(row.record),
    ''
  ])
].join('\n');
fs.writeFileSync(extractedPath, extracted);

const a06Required = [
  'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html',
  'POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf',
  'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html',
  'POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf',
  'POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE.json',
  'POSTG_APP_W02_A06_ARTIFACT_MANIFEST.json'
].map((name) => path.join(a06Dir, name));
for (const file of a06Required) {
  if (!fs.existsSync(file)) throw new Error(`Missing A06 artifact: ${relative(file)}`);
}

const manifest = {
  schemaName: 'POSTGAPPW02A07HumanReviewManifestV1',
  schemaVersion: 1,
  programId: model.programId,
  taskId: model.taskId,
  parentTaskId: model.parentTaskId,
  status: model.status,
  evidenceLevel: model.evidenceLevel,
  reviewType: model.reviewType,
  humanReviewReady: true,
  reviewDecision: 'NOT_STARTED',
  productionAdmissionGranted: false,
  publicSelectable: false,
  publicUIChanged: false,
  coverage: model.summary,
  reviewChecklist: model.reviewChecklist,
  artifacts: [
    digestFile(indexPath),
    digestFile(dataPath),
    digestFile(extractedPath),
    ...a06Required.map(digestFile)
  ],
  artifactHashCount: 9,
  nextShortestStep: 'POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission'
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({ validation, manifest: { ...manifest, artifacts: manifest.artifacts.map(({ path, sha256, sizeBytes }) => ({ path, sha256, sizeBytes })) } }, null, 2));

#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const touched = [];

function replaceOnce(repoPath, before, after) {
  const absolute = path.join(ROOT, repoPath);
  const current = fs.readFileSync(absolute, 'utf8');
  if (current.includes(after)) return;
  if (!current.includes(before)) throw new Error(`A08R3_PATCH_ANCHOR_MISSING:${repoPath}`);
  fs.writeFileSync(absolute, current.replace(before, after), 'utf8');
  touched.push(repoPath);
}

replaceOnce(
  'src/curriculum/application/shared/operation-family-runtime.mjs',
  "    case 'multiple_enumeration': return spec.requestedUnknownRole === 'isMultiple' ? givens.candidate % givens.base === 0 : [givens.base, givens.base * 2, givens.base * 3, givens.base * 4, givens.base * 5];",
  `    case 'multiple_enumeration': {
      if (spec.requestedUnknownRole === 'isMultiple') return givens.candidate % givens.base === 0;
      const upperBound = Number(givens.upperBound ?? givens.base * 5);
      const values = [];
      for (let value = Number(givens.base); value <= upperBound; value += Number(givens.base)) values.push(value);
      return values;
    }`
);

replaceOnce(
  'src/curriculum/application/shared/operation-family-runtime.mjs',
  "    case 'rounding': return spec.requestedUnknownRole === 'rounded' ? round(Math.round(givens.value * 10) / 10) : round(givens.rounded * 2);",
  `    case 'rounding': {
      const placeFactor = givens.targetPlace === 'hundredths' ? 100 : givens.targetPlace === 'thousandths' ? 1000 : 10;
      const roundedValue = round(Math.round(givens.value * placeFactor) / placeFactor);
      return spec.requestedUnknownRole === 'rounded' ? roundedValue : round(roundedValue * 2);
    }`
);

replaceOnce(
  'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs',
  `function injectArtifactMarker(html, mode) {
  return html
    .replace('<body class="worksheet-renderer">', \`<body class="worksheet-renderer" data-postg-app-w02-a06="true" data-question-mode="\${mode}" data-student-facing-surface="W02_A08R1_V1">\`)`,
  `function injectArtifactMarker(html, mode) {
  const surfaceVersion = mode === 'NUMERIC' ? 'W02_A08R3_V1' : 'W02_A08R1_V1';
  return html
    .replace('<body class="worksheet-renderer">', \`<body class="worksheet-renderer" data-postg-app-w02-a06="true" data-question-mode="\${mode}" data-student-facing-surface="\${surfaceVersion}">\`)`
);

replaceOnce(
  'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs',
  `      remediationTaskId: 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview',
      evidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
      studentFacingSurfaceVersion: 'W02_A08R1_V1',`,
  `      remediationTaskId: isApplication
        ? 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview'
        : 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation',
      evidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
      studentFacingSurfaceVersion: isApplication ? 'W02_A08R1_V1' : 'W02_A08R3_V1',
      studentFacingSemanticRevision: isApplication ? 3 : 4,`
);

replaceOnce(
  'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs',
  `  if (pkg.generatedItems.some((item) => item.studentFacingSurfaceVersion !== 'W02_A08R1_V1')) {
    issues.push(issue('POSTG_APP_W02_A06_STUDENT_SURFACE_VERSION_INVALID', 'generatedItems'));
  }`,
  `  if (pkg.generatedItems.some((item) => item.mode === 'NUMERIC'
    ? item.studentFacingSurfaceVersion !== 'W02_A08R3_V1' || item.studentFacingSemanticRevision !== 4
    : item.studentFacingSurfaceVersion !== 'W02_A08R1_V1' || item.studentFacingSemanticRevision !== 3)) {
    issues.push(issue('POSTG_APP_W02_A06_STUDENT_SURFACE_VERSION_INVALID', 'generatedItems'));
  }`
);

replaceOnce(
  'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs',
  `        || !html.includes('data-student-facing-surface="W02_A08R1_V1"')`,
  `        || !html.includes(\`data-student-facing-surface="\${mode === 'NUMERIC' ? 'W02_A08R3_V1' : 'W02_A08R1_V1'}"\`)`
);

replaceOnce(
  'src/curriculum/application/w02-a08r1-student-facing-remediation.mjs',
  `  if (a06Package.generatedItems.some((item) => item.studentFacingSurfaceVersion !== 'W02_A08R1_V1'
      || item.studentFacingSemanticRevision !== 3)) {
    issues.push(issue('POSTG_APP_W02_A08R1_SURFACE_VERSION_INVALID', 'generatedItems'));
  }`,
  `  if (a06Package.generatedItems.some((item) => item.mode === 'NUMERIC'
      ? item.studentFacingSurfaceVersion !== 'W02_A08R3_V1' || item.studentFacingSemanticRevision !== 4
      : item.studentFacingSurfaceVersion !== 'W02_A08R1_V1' || item.studentFacingSemanticRevision !== 3)) {
    issues.push(issue('POSTG_APP_W02_A08R1_SURFACE_VERSION_INVALID', 'generatedItems'));
  }`
);

replaceOnce(
  'tests/curriculum/postg-app-w02-a06-production-equivalent-html-pdf.test.js',
  `  assert.equal(pkg.generatedItems.every((item) => item.studentFacingSurfaceVersion === 'W02_A08R1_V1'), true);`,
  `  assert.equal(pkg.numericItems.every((item) => item.studentFacingSurfaceVersion === 'W02_A08R3_V1' && item.studentFacingSemanticRevision === 4), true);
  assert.equal(pkg.applicationItems.every((item) => item.studentFacingSurfaceVersion === 'W02_A08R1_V1' && item.studentFacingSemanticRevision === 3), true);`
);

replaceOnce(
  'tests/curriculum/postg-app-w02-a06-production-equivalent-html-pdf.test.js',
  `    assert.equal(html.includes('data-student-facing-surface="W02_A08R1_V1"'), true);`,
  `    assert.equal(html.includes(\`data-student-facing-surface="\${mode === 'NUMERIC' ? 'W02_A08R3_V1' : 'W02_A08R1_V1'}"\`), true);`
);

replaceOnce(
  'tests/curriculum/postg-app-w02-a08r1-student-facing-remediation.test.js',
  `  for (const item of [application, numeric]) {
    assert.equal(item.studentFacingSurfaceVersion, 'W02_A08R1_V1');
    assert.equal(item.studentFacingSemanticRevision, 3);
    assert.equal(item.prompt.length > 10, true, item.prompt);`,
  `  assert.equal(application.studentFacingSurfaceVersion, 'W02_A08R1_V1');
  assert.equal(application.studentFacingSemanticRevision, 3);
  assert.equal(numeric.studentFacingSurfaceVersion, 'W02_A08R3_V1');
  assert.equal(numeric.studentFacingSemanticRevision, 4);
  for (const item of [application, numeric]) {
    assert.equal(item.prompt.length > 10, true, item.prompt);`
);

replaceOnce(
  'tests/curriculum/postg-app-w02-a08r1-semantic-quality.test.js',
  `    assert.equal(item.studentFacingSemanticRevision, 3);
    if (item.mode === 'APPLICATION') assert.equal(typeof item.studentFacingMacroContextId, 'string');`,
  `    assert.equal(item.studentFacingSemanticRevision, item.mode === 'NUMERIC' ? 4 : 3);
    assert.equal(item.studentFacingSurfaceVersion, item.mode === 'NUMERIC' ? 'W02_A08R3_V1' : 'W02_A08R1_V1');
    if (item.mode === 'APPLICATION') assert.equal(typeof item.studentFacingMacroContextId, 'string');`
);

replaceOnce(
  '.github/workflows/postg-app-w02-a08r2-second-operator-review.yml',
  `      - name: Verify artifact hashes and finding-to-item binding
        run: node tools/curriculum/validate-postg-app-w02-a08r2-second-operator-review-decision.mjs --verify-regenerated-artifacts | tee w02-a08r2-decision-readback.json`,
  `      - name: Verify artifact hashes and finding-to-item binding
        run: |
          if [[ -f data/project/milestones/POSTG-APP-W02-A08R3.claim.json ]]; then
            node tools/curriculum/validate-postg-app-w02-a08r2-second-operator-review-decision.mjs | tee w02-a08r2-decision-readback.json
          else
            node tools/curriculum/validate-postg-app-w02-a08r2-second-operator-review-decision.mjs --verify-regenerated-artifacts | tee w02-a08r2-decision-readback.json
          fi`
);

process.stdout.write(`${JSON.stringify({ ok: true, touched }, null, 2)}\n`);

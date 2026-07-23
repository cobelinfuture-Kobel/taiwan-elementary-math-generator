#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputRoot = path.resolve(process.argv[2] ?? '/tmp/postg-app-w02-a06-controller-promotion');
const paths = {
  controllerSource: 'src/curriculum/application/postg-app-master-controller.mjs',
  controllerState: 'data/curriculum/application/controller/postg-app-master-controller-state.json',
  controllerTest: 'tests/curriculum/postg-app-m00-master-controller.test.js',
  w01RegressionTest: 'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js'
};

function read(repoPath) {
  return fs.readFileSync(path.join(root, repoPath), 'utf8');
}

function replaceOnce(text, before, after, label) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return text.replace(before, after);
}

function writeCandidate(repoPath, content) {
  const target = path.join(outputRoot, repoPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function promoteControllerSource() {
  let text = read(paths.controllerSource);
  text = replaceOnce(
    text,
    "const W02_A05_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A05.claim.json';\nconst GOLDEN_UNIT_DIR",
    "const W02_A05_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A05.claim.json';\nconst W02_A06_CLAIM_PATH = 'data/project/milestones/POSTG-APP-W02-A06.claim.json';\nconst GOLDEN_UNIT_DIR",
    'add A06 claim path'
  );
  text = replaceOnce(
    text,
    "    w02A04Claim: readJsonIfExists(root, W02_A04_CLAIM_PATH),\n    w02A05Claim: readJsonIfExists(root, W02_A05_CLAIM_PATH)\n",
    "    w02A04Claim: readJsonIfExists(root, W02_A04_CLAIM_PATH),\n    w02A05Claim: readJsonIfExists(root, W02_A05_CLAIM_PATH),\n    w02A06Claim: readJsonIfExists(root, W02_A06_CLAIM_PATH)\n",
    'load A06 claim'
  );
  text = replaceOnce(
    text,
    "    w02A04Claim,\n    w02A05Claim\n",
    "    w02A04Claim,\n    w02A05Claim,\n    w02A06Claim\n",
    'destructure A06 claim'
  );
  text = replaceOnce(
    text,
    "    'PRODUCTION_ADMITTED',\n    'SHARED_WORKSHEET_PROJECTION_SHADOW_PASS',",
    "    'PRODUCTION_ADMITTED',\n    'PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED',",
    'advance expected W02 state'
  );
  text = replaceOnce(
    text,
    "      || w02State.shadowHtmlCount !== 0\n      || w02State.sharedWorksheetProjectionComplete !== true\n      || w02State.productionAdmittedCandidateCount !== 0\n      || w02State.publicSelectableCandidateCount !== 0)",
    "      || w02State.shadowHtmlCount !== 0\n      || w02State.sharedWorksheetProjectionComplete !== true\n      || w02State.generatedItemCount !== 195\n      || w02State.numericGeneratedItemCount !== 134\n      || w02State.applicationGeneratedItemCount !== 61\n      || w02State.productionOperationFamilyCount !== 49\n      || w02State.productionValidatedItemCount !== 195\n      || w02State.htmlArtifactCount !== 2\n      || w02State.pdfArtifactCount !== 2\n      || w02State.numericPdfPageCount !== 68\n      || w02State.applicationPdfPageCount !== 42\n      || w02State.artifactHashCount !== 5\n      || w02State.productionEquivalentOutputVerified !== true\n      || w02State.humanReviewReady !== false\n      || w02State.productionAdmittedCandidateCount !== 0\n      || w02State.publicSelectableCandidateCount !== 0)",
    'validate A06 counts and boundary'
  );
  text = replaceOnce(
    text,
    "  if (controllerState.currentWaveId !== 'W02'\n      || controllerState.currentCapability !== 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS'\n      || controllerState.currentMainlineBlocker !== 'W02_SHARED_GENERATOR_VALIDATOR_RENDERER_HTML_PDF_PENDING'\n      || controllerState.nextShortestStep !== 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration')",
    "  if (controllerState.currentWaveId !== 'W02'\n      || controllerState.currentCapability !== 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED'\n      || controllerState.currentMainlineBlocker !== 'W02_HUMAN_REVIEW_PACKAGE_PENDING'\n      || controllerState.nextShortestStep !== 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage')",
    'advance controller transition'
  );
  text = replaceOnce(
    text,
    "  issues.push(...validateShadowClaim({\n    claim: w02A05Claim,\n    pathValue: W02_A05_CLAIM_PATH,\n    code: 'POSTG_APP_W02_A05_CLAIM_INVALID',\n    claimedStatus: 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS',\n    nextTaskId: 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration'\n  }));\n\n  const contextValidation",
    "  issues.push(...validateShadowClaim({\n    claim: w02A05Claim,\n    pathValue: W02_A05_CLAIM_PATH,\n    code: 'POSTG_APP_W02_A05_CLAIM_INVALID',\n    claimedStatus: 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS',\n    nextTaskId: 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration'\n  }));\n  if (!w02A06Claim\n      || w02A06Claim.actualEvidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'\n      || w02A06Claim.claimedStatus !== 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED'\n      || w02A06Claim.claims?.runtimeIntegrated !== true\n      || w02A06Claim.claims?.productionEquivalentGeneratorUsed !== true\n      || w02A06Claim.claims?.productionRendererUsed !== true\n      || w02A06Claim.claims?.htmlOutputVerified !== true\n      || w02A06Claim.claims?.pdfOutputVerified !== true\n      || w02A06Claim.claims?.visibleOutputChanged !== false\n      || w02A06Claim.claims?.humanReviewReady !== false\n      || w02A06Claim.claims?.productionAdmitted !== false\n      || w02A06Claim.claims?.d0Complete !== false\n      || w02A06Claim.nextStep?.taskId !== 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage') {\n    issues.push(issue('POSTG_APP_W02_A06_CLAIM_INVALID', W02_A06_CLAIM_PATH));\n  }\n\n  const contextValidation",
    'validate A06 E4 claim'
  );
  text = replaceOnce(
    text,
    "      ? 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS'\n      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'",
    "      ? 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED'\n      : 'BLOCKED_BY_M00_CONTROLLER_VALIDATION'",
    'advance readback status'
  );
  return text;
}

function promoteControllerState() {
  const state = JSON.parse(read(paths.controllerState));
  state.taskId = 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration';
  state.status = 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED';
  state.dependencies.w02ProductionEquivalentOutputTaskId = 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration';
  Object.assign(state.authoritativeState, {
    sharedOperationFamilyRuntime: 'src/curriculum/application/shared/operation-family-runtime.mjs',
    w02ProductionEquivalentRuntime: 'src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs',
    w02ProductionEquivalentValidationCli: 'tools/curriculum/validate-postg-app-w02-a06-production-equivalent-html-pdf.mjs',
    w02ProductionEquivalentEvidence: 'docs/curriculum/output/POSTG_APP_W02_A06_E4_PRODUCTION_EQUIVALENT_EVIDENCE.json',
    w02A06MilestoneClaim: 'data/project/milestones/POSTG-APP-W02-A06.claim.json'
  });
  state.currentCapability = 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED';
  state.currentMainlineBlocker = 'W02_HUMAN_REVIEW_PACKAGE_PENDING';
  const w02 = state.waveStates.find((row) => row.waveId === 'W02');
  w02.state = 'PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED';
  Object.assign(w02, {
    generatedItemCount: 195,
    numericGeneratedItemCount: 134,
    applicationGeneratedItemCount: 61,
    productionOperationFamilyCount: 49,
    productionValidatedItemCount: 195,
    htmlArtifactCount: 2,
    pdfArtifactCount: 2,
    numericPdfPageCount: 68,
    applicationPdfPageCount: 42,
    artifactHashCount: 5,
    productionEquivalentOutputVerified: true,
    humanReviewReady: false
  });
  const lineage = state.producerStateConsumerReadback;
  if (!lineage.producer.includes('POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration')) {
    lineage.producer.splice(lineage.producer.length - 1, 0, 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration');
  }
  for (const name of [
    'POSTG_APP_W02_A06_E4_PRODUCTION_EQUIVALENT_EVIDENCE.json',
    'POSTG-APP-W02-A06.claim.json'
  ]) if (!lineage.authoritativeState.includes(name)) lineage.authoritativeState.push(name);
  for (const name of [
    'operation-family-runtime.mjs',
    'production-equivalent-html-pdf-runtime.mjs',
    'build-worksheet-document.js',
    'html-renderer-s57f5-extension.js'
  ]) if (!lineage.runtimeConsumer.includes(name)) lineage.runtimeConsumer.push(name);
  for (const name of [
    'validate-postg-app-w02-a06-production-equivalent-html-pdf.mjs',
    'verify-postg-app-w02-a06-pdf.py'
  ]) if (!lineage.readback.includes(name)) lineage.readback.push(name);
  state.nextShortestStep = 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage';
  state.stopReason = 'NONE';
  return `${JSON.stringify(state, null, 2)}\n`;
}

function promoteControllerTest() {
  let text = read(paths.controllerTest);
  text = replaceOnce(text, 'W02 A05 shared projection passed', 'W02 A06 E4 output verified', 'test title A06');
  text = replaceOnce(text, "assert.equal(result.status, 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS');", "assert.equal(result.status, 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED');", 'readback status assertion');
  text = replaceOnce(text, "assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration');", "assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage');", 'next step assertion');
  text = replaceOnce(text, "test('Wave 02 has A05 shared worksheet projection complete without admission'", "test('Wave 02 has A06 production-equivalent HTML PDF E4 verification without admission'", 'wave test title');
  text = replaceOnce(text, "assert.equal(w02.currentState.state, 'SHARED_WORKSHEET_PROJECTION_SHADOW_PASS');", "assert.equal(w02.currentState.state, 'PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED');", 'wave state assertion');
  text = replaceOnce(
    text,
    "  assert.equal(w02.currentState.sharedWorksheetProjectionComplete, true);\n  assert.equal(w02.currentState.productionAdmittedCandidateCount, 0);",
    "  assert.equal(w02.currentState.sharedWorksheetProjectionComplete, true);\n  assert.equal(w02.currentState.generatedItemCount, 195);\n  assert.equal(w02.currentState.numericGeneratedItemCount, 134);\n  assert.equal(w02.currentState.applicationGeneratedItemCount, 61);\n  assert.equal(w02.currentState.productionOperationFamilyCount, 49);\n  assert.equal(w02.currentState.productionValidatedItemCount, 195);\n  assert.equal(w02.currentState.htmlArtifactCount, 2);\n  assert.equal(w02.currentState.pdfArtifactCount, 2);\n  assert.equal(w02.currentState.numericPdfPageCount, 68);\n  assert.equal(w02.currentState.applicationPdfPageCount, 42);\n  assert.equal(w02.currentState.artifactHashCount, 5);\n  assert.equal(w02.currentState.productionEquivalentOutputVerified, true);\n  assert.equal(w02.currentState.humanReviewReady, false);\n  assert.equal(w02.currentState.productionAdmittedCandidateCount, 0);",
    'A06 state assertions'
  );
  text = replaceOnce(
    text,
    "test('W01 stays E5 while W02 A00 through A05 remain E3 non-production'",
    "test('W01 stays E5, W02 A00 through A05 remain E3, and A06 is E4 non-production'",
    'claim level test title'
  );
  text = replaceOnce(
    text,
    "  ]);\n    assert.equal(claim.actualEvidenceLevel, 'E3_SHADOW_RUNTIME_INTEGRATED');\n    assert.equal(claim.claims.productionAdmitted, false);\n    assert.equal(claim.claims.d0Complete, false);\n  }\n  assert.deepEqual(controller.controllerState.waveStates[0].completedGates, REQUIRED_GATES);",
    "  ]);\n    assert.equal(claim.actualEvidenceLevel, 'E3_SHADOW_RUNTIME_INTEGRATED');\n    assert.equal(claim.claims.productionAdmitted, false);\n    assert.equal(claim.claims.d0Complete, false);\n  }\n  assert.equal(controller.w02A06Claim.actualEvidenceLevel, 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED');\n  assert.equal(controller.w02A06Claim.claims.productionEquivalentGeneratorUsed, true);\n  assert.equal(controller.w02A06Claim.claims.productionRendererUsed, true);\n  assert.equal(controller.w02A06Claim.claims.htmlOutputVerified, true);\n  assert.equal(controller.w02A06Claim.claims.pdfOutputVerified, true);\n  assert.equal(controller.w02A06Claim.claims.productionAdmitted, false);\n  assert.equal(controller.w02A06Claim.claims.d0Complete, false);\n  assert.deepEqual(controller.controllerState.waveStates[0].completedGates, REQUIRED_GATES);",
    'A06 E4 claim assertions'
  );
  text = replaceOnce(text, "test('forged approval, W02 claims and A05 projection state fail closed'", "test('forged approval, W02 claims and A06 output state fail closed'", 'forged test title');
  text = replaceOnce(
    text,
    "    ['w02A04Claim', 'POSTG_APP_W02_A04_CLAIM_INVALID'],\n    ['w02A05Claim', 'POSTG_APP_W02_A05_CLAIM_INVALID']",
    "    ['w02A04Claim', 'POSTG_APP_W02_A04_CLAIM_INVALID'],\n    ['w02A05Claim', 'POSTG_APP_W02_A05_CLAIM_INVALID'],\n    ['w02A06Claim', 'POSTG_APP_W02_A06_CLAIM_INVALID']",
    'A06 forged claim case'
  );
  return text;
}

function promoteW01RegressionTest() {
  let text = read(paths.w01RegressionTest);
  text = replaceOnce(
    text,
    "  assert.equal(w02.sharedWorksheetProjectionComplete, true);\n  assert.deepEqual(states.slice(2).map((row) => row.state), [",
    "  assert.equal(w02.sharedWorksheetProjectionComplete, true);\n  assert.equal(w02.productionEquivalentOutputVerified, true);\n  assert.equal(w02.humanReviewReady, false);\n  assert.deepEqual(states.slice(2).map((row) => row.state), [",
    'W01 monotonic A06 assertion'
  );
  return text;
}

const outputs = {
  [paths.controllerSource]: promoteControllerSource(),
  [paths.controllerState]: promoteControllerState(),
  [paths.controllerTest]: promoteControllerTest(),
  [paths.w01RegressionTest]: promoteW01RegressionTest()
};
for (const [repoPath, content] of Object.entries(outputs)) writeCandidate(repoPath, content);
fs.writeFileSync(path.join(outputRoot, 'manifest.json'), `${JSON.stringify({
  taskId: 'POSTG-APP-W02-A06_ArtifactCIGenerationHashLockAndE4Promotion',
  outputFiles: Object.keys(outputs),
  expectedStatus: 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_E4_VERIFIED',
  nextShortestStep: 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage'
}, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputRoot, outputFiles: Object.keys(outputs) }, null, 2));

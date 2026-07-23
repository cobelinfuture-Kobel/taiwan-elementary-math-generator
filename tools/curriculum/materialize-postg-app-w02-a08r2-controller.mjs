#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { applyW02A08R2ControllerOverlay } from '../../src/curriculum/application/w02-a08r2-controller-overlay.mjs';

const ROOT = process.cwd();
const CONTROLLER_PATH = 'src/curriculum/application/postg-app-master-controller.mjs';
const STATE_PATH = 'data/curriculum/application/controller/postg-app-master-controller-state.json';
const M00_TEST_PATH = 'tests/curriculum/postg-app-m00-master-controller.test.js';
const W01_TEST_PATH = 'tests/curriculum/postg-app-w01-a06e-operator-approval.test.js';

function replaceOnce(text, from, to, label) {
  if (text.includes(to)) return text;
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one source occurrence, found ${count}`);
  return text.replace(from, to);
}

function writeIfChanged(repoPath, content) {
  const absolutePath = path.join(ROOT, repoPath);
  const current = fs.readFileSync(absolutePath, 'utf8');
  if (current === content) return false;
  fs.writeFileSync(absolutePath, content);
  return true;
}

function patchController() {
  let text = fs.readFileSync(path.join(ROOT, CONTROLLER_PATH), 'utf8');
  text = replaceOnce(text,
    "import { buildW02A08R1Readback } from './w02-a08r1-student-facing-remediation.mjs';",
    "import { buildW02A08R1Readback } from './w02-a08r1-student-facing-remediation.mjs';\nimport {\n  applyW02A08R2ControllerOverlay,\n  loadW02A08R2ControllerEvidence,\n  validateW02A08R2ControllerEvidence,\n  W02_A08R2_DECISION_PATH,\n  W02_A08R2_EVIDENCE_PATH,\n  W02_A08R2_STATUS,\n  W02_A08R3_TASK\n} from './w02-a08r2-controller-overlay.mjs';",
    'controller import');
  text = replaceOnce(text,
    '  const controllerState = readJson(root, CONTROLLER_STATE_PATH);',
    '  const baseControllerState = readJson(root, CONTROLLER_STATE_PATH);\n  const a08r2Evidence = loadW02A08R2ControllerEvidence({ root });\n  const controllerState = applyW02A08R2ControllerOverlay({ root, controllerState: baseControllerState });',
    'controller state overlay');
  text = replaceOnce(text,
    '    w02A08Decision: readJsonIfExists(root, W02_A08_DECISION_PATH),\n    w02A08R1Readback: buildW02A08R1Readback({ root })',
    '    w02A08Decision: readJsonIfExists(root, W02_A08_DECISION_PATH),\n    w02A08R1Readback: buildW02A08R1Readback({ root }),\n    ...a08r2Evidence',
    'controller evidence load');
  text = replaceOnce(text,
    "    operatorDecisionState: 'REVISE_RECORDED',",
    "    operatorDecisionState: 'SECOND_REVISE_RECORDED',",
    'controller metric decision state');
  text = replaceOnce(text,
    "    'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY',",
    '    W02_A08R2_STATUS,',
    'controller expected state');
  text = replaceOnce(text,
    "      || w02State.reviewEvidence !== 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_MANIFEST.json'\n      || w02State.decisionEvidence !== W02_A08_DECISION_PATH",
    '      || w02State.reviewEvidence !== W02_A08R2_EVIDENCE_PATH\n      || w02State.decisionEvidence !== W02_A08R2_DECISION_PATH',
    'controller review evidence');
  text = replaceOnce(text,
    "      || controllerState.currentCapability !== 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY'\n      || controllerState.currentMainlineBlocker !== 'W02_REGENERATED_HTML_PDF_SECOND_OPERATOR_REVIEW_DECISION_PENDING'\n      || controllerState.nextShortestStep !== 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision'",
    "      || controllerState.currentCapability !== W02_A08R2_STATUS\n      || controllerState.currentMainlineBlocker !== 'W02_NUMERIC_STUDENT_FACING_SURFACE_REMEDIATION_REQUIRED'\n      || controllerState.nextShortestStep !== W02_A08R3_TASK",
    'controller transition');
  text = replaceOnce(text,
    '  issues.push(...validateA08Evidence(controller));',
    '  issues.push(...validateA08Evidence(controller));\n  issues.push(...validateW02A08R2ControllerEvidence(controller));',
    'controller A08R2 validation');
  text = replaceOnce(text,
    "      ? 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY'",
    '      ? W02_A08R2_STATUS',
    'controller return status');
  return writeIfChanged(CONTROLLER_PATH, text);
}

function patchM00Test() {
  let text = fs.readFileSync(path.join(ROOT, M00_TEST_PATH), 'utf8');
  text = replaceOnce(text,
    "const A08R1_STATUS = 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY';\nconst A08R2_TASK = 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision';\nconst A08_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08_OperatorHumanReviewDecision.json';",
    "const A08R1_STATUS = 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY';\nconst A08R2_STATUS = 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED';\nconst A08R2_TASK = 'POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision';\nconst A08R3_TASK = 'POSTG-APP-W02-A08R3_NumericStudentFacingUnknownRoleGivenSetAndNotationRemediation';\nconst A08_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08_OperatorHumanReviewDecision.json';\nconst A08R2_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W02-A08R2_RegeneratedHTMLPDFSecondOperatorReviewDecision.json';",
    'M00 constants');
  text = replaceOnce(text,
    "test('M00 validates the exact 79-node scope with W01 admitted and W02 A08R1 review ready', () => {",
    "test('M00 validates the exact 79-node scope with W01 admitted and W02 A08R2 second REVISE recorded', () => {",
    'M00 first title');
  text = replaceOnce(text, '  assert.equal(result.status, A08R1_STATUS);', '  assert.equal(result.status, A08R2_STATUS);', 'M00 first status');
  text = replaceOnce(text, '  assert.equal(result.nextShortestStep, A08R2_TASK);', '  assert.equal(result.nextShortestStep, A08R3_TASK);', 'M00 first next');
  text = replaceOnce(text,
    "test('Wave 02 records A08 REVISE and A08R1 semantic review readiness without admission', () => {",
    "test('Wave 02 records A08R2 second REVISE without admission', () => {",
    'M00 wave title');
  text = replaceOnce(text, '  assert.equal(state.state, A08R1_STATUS);', '  assert.equal(state.state, A08R2_STATUS);', 'M00 wave state');
  text = replaceOnce(text, '  assert.equal(state.decisionEvidence, A08_DECISION_PATH);', '  assert.equal(state.decisionEvidence, A08R2_DECISION_PATH);', 'M00 decision evidence');
  text = replaceOnce(text, "  assert.equal(state.operatorDecisionState, 'REVISE_RECORDED');", "  assert.equal(state.operatorDecisionState, 'SECOND_REVISE_RECORDED');", 'M00 operator state');
  text = replaceOnce(text,
    '  assert.equal(state.productionEquivalentOutputVerified, true);\n});',
    "  assert.equal(state.productionEquivalentOutputVerified, true);\n  assert.equal(state.secondOperatorReviewComplete, true);\n  assert.equal(state.secondOperatorReviewDecision, 'REVISE');\n  assert.equal(state.unresolvedRequestedRoleSurfaceCount, 13);\n  assert.equal(state.answerEquivalentGivenLeakageCount, 19);\n  assert.equal(state.malformedOrIncoherentNumericSurfaceCount, 12);\n  assert.equal(state.gradeUnsafeNotationCount, 2);\n});",
    'M00 A08R2 state fields');
  text = replaceOnce(text,
    "  for (const claim of [controller.w02A06Claim, controller.w02A07Claim, controller.w02A08Claim]) {",
    '  for (const claim of [controller.w02A06Claim, controller.w02A07Claim, controller.w02A08Claim, controller.w02A08R2Claim]) {',
    'M00 prior evidence claims');
  return writeIfChanged(M00_TEST_PATH, text);
}

function patchW01Test() {
  let text = fs.readFileSync(path.join(ROOT, W01_TEST_PATH), 'utf8');
  text = replaceOnce(text,
    "    'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY',\n    'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY'",
    "    'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY',\n    'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY',\n    'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED'",
    'W01 review ready states');
  text = replaceOnce(text,
    "  if (w02.state === 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY') {\n    assert.equal(w02.humanReviewPackageComplete, true);\n    assert.equal(w02.reviewDecision, 'REVISE');\n    assert.equal(w02.operatorDecisionState, 'REVISE_RECORDED');\n    assert.equal(w02.studentFacingSemanticRevision, 3);\n    assert.equal(w02.regeneratedHtmlPdfReviewReady, true);\n  }",
    "  if (w02.state === 'W02_A08R1_PATTERN_SEMANTIC_AND_OPERATION_SPECIFIC_PBL_REVIEW_READY') {\n    assert.equal(w02.humanReviewPackageComplete, true);\n    assert.equal(w02.reviewDecision, 'REVISE');\n    assert.equal(w02.operatorDecisionState, 'REVISE_RECORDED');\n    assert.equal(w02.studentFacingSemanticRevision, 3);\n    assert.equal(w02.regeneratedHtmlPdfReviewReady, true);\n  }\n  if (w02.state === 'W02_A08R2_SECOND_OPERATOR_REVIEW_REVISE_REQUIRED') {\n    assert.equal(w02.humanReviewPackageComplete, true);\n    assert.equal(w02.reviewDecision, 'REVISE');\n    assert.equal(w02.operatorDecisionState, 'SECOND_REVISE_RECORDED');\n    assert.equal(w02.secondOperatorReviewComplete, true);\n    assert.equal(w02.productionAdmissionGranted, false);\n  }",
    'W01 A08R2 branch');
  return writeIfChanged(W01_TEST_PATH, text);
}

function materializeState() {
  const current = JSON.parse(fs.readFileSync(path.join(ROOT, STATE_PATH), 'utf8'));
  const revised = applyW02A08R2ControllerOverlay({ root: ROOT, controllerState: current });
  return writeIfChanged(STATE_PATH, `${JSON.stringify(revised)}\n`);
}

const changed = {
  controller: patchController(),
  state: materializeState(),
  m00Test: patchM00Test(),
  w01Test: patchW01Test()
};
console.log(JSON.stringify({ changed, changedCount: Object.values(changed).filter(Boolean).length }, null, 2));

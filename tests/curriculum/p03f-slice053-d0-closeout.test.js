import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G6A_U04_P03F53_SOURCE_ID,
  G6A_U04_P03F53_ROUNDING_KP_ID,
  G6A_U04_P03F53_ROUNDING_GROUP_ID,
  G6A_U04_P03F53_ROUNDING_SPEC_ID,
  P03F53_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g6a-u04-rank13-rounding-selector-projection-p03f53.js";
import {
  generateG6AU04P03F53Questions,
  validateG6AU04P03F53Question,
} from "../../site/modules/curriculum/batch-a/g6a-u04-rank13-rounding-runtime-p03f53.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f53-extension.js";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const claim = readJson("../../data/curriculum/final-milestone-claims/p03f-w3-slice053-e6-d0-v1.json");
const manifest = readJson("../../data/curriculum/full-product/p03f/slice053-product-admission.manifest.json");
const authority = readJson("../../data/curriculum/full-product/p03f/slice053-g6a-u04-rank13-rounding-authority.json");
const resolution = readJson("../../data/curriculum/full-product/p03f/slice053-g6a-u04-direct-source-witness-resolution.json");
const queue = readJson("../../data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json");
const q052Claim = readJson("../../data/curriculum/final-milestone-claims/p03f-w3-slice052-e6-d0-v1.json");
const impactPolicy = readJson("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json");

const KP_IDS = [G6A_U04_P03F53_ROUNDING_KP_ID];
const GROUP_IDS = [G6A_U04_P03F53_ROUNDING_GROUP_ID];
const SPEC_IDS = [G6A_U04_P03F53_ROUNDING_SPEC_ID];
const IS_FINAL = claim.status === "PASS_D0_CLOSED";

function decimalFraction(text) {
  const [whole, fraction = ""] = String(text).split(".");
  return { numerator: BigInt(`${whole}${fraction}`), denominator: 10n ** BigInt(fraction.length) };
}
function expectedHalfUp(dividend, divisor, scale) {
  const a = decimalFraction(dividend);
  const b = decimalFraction(divisor);
  const numerator = a.numerator * b.denominator;
  const denominator = a.denominator * b.numerator;
  const factor = 10n ** BigInt(scale);
  const scaled = numerator * factor;
  const kept = scaled / denominator;
  const remainder = scaled % denominator;
  const rounded = kept + (remainder !== 0n && remainder * 2n >= denominator ? 1n : 0n);
  const digits = rounded.toString();
  if (scale === 0) return digits;
  const padded = digits.padStart(scale + 1, "0");
  return `${padded.slice(0, -scale)}.${padded.slice(-scale)}`;
}

function sourceText(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("P03F53 closeout binds the final frozen q053 scope and predecessor D0", () => {
  assert.equal(q052Claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.authority.queuePosition, 53);
  assert.equal(claim.authority.queueEntryId, "p03e_q053_r13_g6a_u04_6a04_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G6A_U04_P03F53_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, KP_IDS);
  assert.deepEqual(claim.authority.patternGroupIds, GROUP_IDS);
  assert.deepEqual(claim.authority.patternSpecIds, SPEC_IDS);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F53_REQUIRED_CAPABILITY_IDS]);
  assert.equal(claim.authority.operationFamilyId, "decimal_division");
  assert.deepEqual(claim.authority.answerTypes, ["decimal_approximation"]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [34, 259, 5, 0, 0]);
  assert.equal(authority.queueAuthority.queuePosition, 53);
  assert.equal(authority.queueAuthority.sliceId, claim.authority.queueEntryId);
  assert.deepEqual(authority.queueAuthority.knowledgePointIds, KP_IDS);
  assert.equal(authority.queueAuthority.nextSliceId, null);
  assert.equal(authority.queueAuthority.queueMutationAllowed, false);
  assert.equal(queue.queueSliceCount, 53);
  assert.equal(queue.orderedSliceIds.length, 53);
  assert.equal(queue.orderedSliceIds.at(-1), claim.authority.queueEntryId);
  assert.equal(queue.lastSliceId, claim.authority.queueEntryId);
  assert.equal(queue.orderedImplementationTaskIds.length, 53);
  assert.equal(queue.orderedKnowledgePointIds.at(-1), G6A_U04_P03F53_ROUNDING_KP_ID);
  assert.equal(claim.progression.finalFrozenQueueSlice, true);
  assert.equal(claim.progression.nextSliceId, null);
});

test("P03F53 closeout preserves direct source evidence without extension inflation", () => {
  assert.equal(resolution.status, "PASS_DIRECT_SOURCE_WITNESS_RESOLVED");
  assert.equal(claim.sourceEvidence.status, resolution.status);
  assert.equal(claim.sourceEvidence.sourceFileName, "meow911_6a04_source.pdf");
  assert.equal(claim.sourceEvidence.sourceDriveFileId, "1jFp8TvNtrECiCMuYCENyPeZNbb3fQNM1");
  assert.equal(claim.sourceEvidence.sourceSha256, "1e1790a2fe9a91e4d819d0c9ff93d3065dde536887d93c5e20323f7011df8f50");
  assert.equal(claim.sourceEvidence.sourceByteLength, 482611);
  assert.deepEqual(claim.sourceEvidence.reviewedPages, [1, 2]);
  assert.equal(claim.sourceEvidence.decimalRoundingDirectTextbookWitness, true);
  assert.equal(claim.sourceEvidence.quotientRequestedPlaceDirectTextbookWitness, true);
  assert.equal(claim.sourceEvidence.visibleRoundingHeading, "小數取概數");
  assert.equal(claim.sourceEvidence.visibleRoundingInstruction, "四捨五入取到個位");
  assert.equal(claim.sourceEvidence.visibleQuotientExpression, "107.9 ÷ 7");
  assert.equal(claim.sourceEvidence.visibleQuotientInstruction, "商取到小數第一位");
  assert.equal(claim.sourceEvidence.operatorApprovedExtensionRequired, false);
  assert.equal(claim.sourceEvidence.generatedExampleClaimedAsTextbook, false);
  assert.equal(resolution.resolution.operatorApprovedExtensionRequired, false);
  assert.equal(resolution.resolution.generatedExampleClaimedAsTextbook, false);
  assert.equal(resolution.resolution.globalContextExpansionAllowed, false);
  assert.equal(resolution.resolution.parallelPipelineAllowed, false);
});

test("P03F53 implementation and deployed evidence bind exact successful artifacts", () => {
  assert.equal(claim.implementationEvidence.prNumber, 675);
  assert.equal(claim.implementationEvidence.headSha, "9f16ee474df95f357dde1f76daad64cdeffc627c");
  assert.equal(claim.implementationEvidence.mergeSha, "d0bb3b875fa7a6646588b68ef289268313e43cdc");
  assert.equal(claim.implementationEvidence.node.runId, 32695073640);
  assert.equal(claim.implementationEvidence.node.jobId, 97335550581);
  assert.equal(claim.implementationEvidence.node.status, "SUCCESS");
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.runId, product.focusedJobId, product.jobId], [32695073543, 97335555084, 97335613653]);
  assert.equal(product.artifactId, 9508570144);
  assert.equal(product.artifactDigest, "sha256:6b241eb364ec24884e96836326b39e0113d25446a3d7b758ec4b0efd81ca6a0c");
  assert.deepEqual([product.questionCount, product.answerCount, product.roundingQuestionCount], [24, 24, 24]);
  assert.deepEqual([product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount], [3, 3, 6]);
  assert.deepEqual(product.requestedScales, [0, 1, 2]);
  assert.deepEqual(product.roundingRelationClasses, ["EXACT_HALF", "GREATER_THAN_HALF", "LESS_THAN_HALF"]);
  assert.deepEqual([
    product.exactAnswerMismatchCount,
    product.approximationSurfaceMismatchCount,
    product.crossLayerMismatchCount,
    product.duplicatePromptCount,
    product.scopeLeakCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], Array(8).fill(0));
  assert.equal(product.directTextbookRoundingWitness, true);
  assert.equal(product.operatorApprovedExtensionUsed, false);
  assert.equal(product.floatingPointAuthorityUsed, false);
  assert.equal(product.sharedExactRationalNormalizer, true);
  assert.equal(product.sharedDecimalDivisionFamily, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.parallelPipeline, false);

  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 676);
  assert.equal(e2e.headSha, "ece8068d816465ec3c8bb6b100ba190c5f0fe831");
  assert.equal(e2e.mergeSha, "3aae8af779d06ae160f86b8b3e87aaca8e4dc0e9");
  assert.deepEqual([e2e.runId, e2e.jobId, e2e.artifactId], [32696562748, 97339645551, 9509018393]);
  assert.equal(e2e.artifactDigest, "sha256:e5c0d4baa646b1ea98aae91ddfe1d636d5156128f5e6b37750c7e776844e9149");
  assert.equal(e2e.status, "PASS_P03F53_DEPLOYED_MAIN_PAGES_E2E");
  assert.equal(e2e.preflightStatus, "PASS_P03F53_DEPLOYED_DEPENDENCY_AND_UI_PREFLIGHT");
  assert.deepEqual([e2e.dependencyClosureAssetCount, e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [14, 13, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [34, 259]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [5, 0, 0]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual(e2e.requestedScales, [0, 1, 2]);
  assert.deepEqual(e2e.roundingRelationClasses, ["EXACT_HALF", "GREATER_THAN_HALF", "LESS_THAN_HALF"]);
  assert.deepEqual([
    e2e.exactAnswerMismatchCount,
    e2e.crossLayerMismatchCount,
    e2e.scopeLeakCount,
    e2e.approximationMismatchCount,
    e2e.duplicatePromptCount,
    e2e.consoleErrorCount,
    e2e.pageErrorCount,
    e2e.requestFailureCount,
    e2e.serverErrorCount,
  ], Array(9).fill(0));
});

test("P03F53 current registry and exact rational runtime remain D0-usable", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 35);
  assert.equal(pixel.visibleKnowledgePointCount, 260);
  const source = pixel.bySourceId[G6A_U04_P03F53_SOURCE_ID];
  assert.ok(source);
  assert.deepEqual([source.visibleKnowledgePoints.length, source.hiddenPendingCount, source.notSelectableCount], [5, 0, 0]);
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G6A_U04_P03F53_ROUNDING_KP_ID));

  const generated = generateG6AU04P03F53Questions({
    sourceId: G6A_U04_P03F53_SOURCE_ID,
    patternSpecIds: SPEC_IDS,
    questionMode: "numeric",
    questionCount: 27,
    generationSeed: "p03f53-d0-closeout",
  });
  assert.equal(generated.ok, true);
  assert.equal(generated.questions.length, 27);
  assert.deepEqual(new Set(generated.questions.map((q) => q.requestedScale)), new Set([0, 1, 2]));
  assert.deepEqual(new Set(generated.questions.map((q) => q.roundingRelation)), new Set(["LESS_THAN_HALF", "EXACT_HALF", "GREATER_THAN_HALF"]));
  assert.equal(new Set(generated.questions.map((q) => q.blankedDisplayText)).size, 27);
  for (const q of generated.questions) {
    assert.equal(validateG6AU04P03F53Question(q).ok, true);
    assert.equal(q.answerText, expectedHalfUp(q.decimalDividend, q.decimalDivisor, q.requestedScale));
    assert.ok(q.promptText.includes("四捨五入"));
    assert.ok(q.promptText.includes("概數"));
    assert.ok(q.blankedDisplayText.includes("≈"));
    assert.equal(q.finalAnswer.exact, false);
    assert.equal(q.metadata.operatorApprovedExtension, false);
    assert.equal(q.metadata.generatedExampleClaimedAsTextbook, false);
    assert.equal(q.metadata.floatingPointAuthorityUsed, false);
    assert.equal(q.metadata.globalContextExpansion, false);
  }
});

test("P03F53 shared worksheet produces stable 24Q/24A on existing renderer path", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: G6A_U04_P03F53_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: KP_IDS,
    selectedPatternGroupIds: GROUP_IDS,
    patternSpecIds: SPEC_IDS,
    questionMode: "numeric",
    questionCount: 24,
    generationSeed: "p03f53-d0-worksheet",
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const doc = result.worksheetDocument;
  assert.equal(doc.questionCount, 24);
  assert.equal(doc.answerKeyItems.length, 24);
  assert.equal(doc.questionPages.length, 3);
  assert.equal(doc.answerKeyPages.length, 3);
  assert.equal(doc.summary.roundingQuestionCount, 24);
  assert.equal(doc.metadata.roundingExpansion, true);
  assert.equal(doc.metadata.slice053Expansion, true);
  assert.equal(doc.metadata.roundingDirectTextbookWitness, true);
  assert.equal(doc.metadata.roundingOperatorApprovedExtension, false);
  assert.equal(doc.metadata.globalContextExpansion, false);
  assert.equal(doc.metadata.worksheetAdapter.sharedExactRationalNormalizer, true);
  assert.equal(doc.metadata.worksheetAdapter.sharedDecimalDivisionFamily, true);
  assert.equal(doc.metadata.worksheetAdapter.sharedPagination, true);
  assert.equal(doc.metadata.worksheetAdapter.sharedRenderer, true);
  assert.equal(doc.metadata.worksheetAdapter.parallelPipeline, false);
  for (let i = 0; i < 24; i += 1) {
    assert.equal(doc.questionDisplayModels[i].questionId, doc.answerKeyItems[i].questionId);
    assert.equal(doc.generatedQuestions[i].answerText, doc.answerKeyItems[i].answerText);
  }
});

test("P03F53 current consumers stay cut over to Slice053 and Change Impact remains bounded L3", () => {
  const consumers = {
    classic: sourceText("site/assets/browser/public-capability-ui.js"),
    patternState: sourceText("site/assets/browser/state/public-pattern-group-selection.js"),
    queryState: sourceText("site/assets/browser/state/query-state.js"),
    selector: sourceText("site/modules/curriculum/registry/batch-a-selector-extension.js"),
    pixelBinding: sourceText("site/pixel/pixel-public-capability-ui.js"),
    pixelRegistry: sourceText("site/pixel/pixel-registry-bridge.js"),
    worksheet: sourceText("site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"),
  };
  assert.match(consumers.classic, /public-ui-capability-binding-p04f1\.js/);
  assert.match(consumers.patternState, /batch-a-selector-p04f1-extension\.js/);
  assert.match(consumers.queryState, /batch-a-selector-p04f1-extension\.js/);
  assert.match(consumers.selector, /batch-a-selector-p04f1-extension\.js/);
  assert.match(consumers.pixelBinding, /public-ui-capability-binding-p04f1\.js/);
  assert.match(consumers.pixelRegistry, /batch-a-selector-p04f1-extension\.js/);
  assert.match(consumers.worksheet, /batch-a-browser-worksheet-p04f1-extension\.js/);

  assert.equal(impactPolicy.policyId, "P03F_CHANGE_IMPACT_GATE_V1");
  assert.equal(impactPolicy.invariants.d0CloseoutAloneTriggersFullReplay, false);
  assert.equal(impactPolicy.currentFrozenFullReplay.legalRouteCount, 793);
  assert.equal(claim.changeImpactGate.level, "L3");
  assert.equal(claim.changeImpactGate.affectedRouteSetBounded, true);
  assert.equal(claim.changeImpactGate.targetedRouteReplayRequired, true);
  assert.equal(claim.changeImpactGate.targetedRouteReplayStatus, "PASS_IMPLEMENTATION_PRODUCT_ACCEPTANCE_AND_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(claim.changeImpactGate.fullRouteReplayRequired, false);
});

test("P03F53 D0 candidate is fail-closed until exact candidate CI and reconciliation", () => {
  assert.ok(["D0_CLOSEOUT_CANDIDATE", "PASS_D0_CLOSED"].includes(claim.status));
  assert.equal(manifest.queuePosition, 53);
  assert.deepEqual(manifest.knowledgePointIds, KP_IDS);
  assert.deepEqual(manifest.patternGroupIds, GROUP_IDS);
  assert.deepEqual(manifest.patternSpecIds, SPEC_IDS);
  assert.equal(manifest.productionAdmission.nextSliceExists, false);
  if (!IS_FINAL) {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(claim.mainReadback.candidateMergeSha, null);
    assert.equal(claim.progression.frozenQueueComplete, false);
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.goalDistance, "D1");
    assert.equal(manifest.productionAdmission.slice053Admitted, false);
    assert.equal(manifest.productionAdmission.frozenQueueComplete, false);
  } else {
    assert.equal(claim.goalDistance, "D0");
    assert.equal(claim.closeoutEvidence.status, "PASS_EXACT_HEAD_NODE_AND_POSTMERGE_RECONCILED");
    assert.ok(Number.isInteger(claim.closeoutEvidence.candidatePrNumber));
    assert.match(claim.closeoutEvidence.candidateHeadSha, /^[0-9a-f]{40}$/);
    assert.match(claim.closeoutEvidence.candidateMergeSha, /^[0-9a-f]{40}$/);
    assert.equal(claim.progression.frozenQueueComplete, true);
    assert.equal(manifest.status, "PASS_D0_CLOSED");
    assert.equal(manifest.admissionState, "ADMITTED_FINAL_FROZEN_QUEUE_SLICE");
    assert.equal(manifest.goalDistance, "D0");
    assert.equal(manifest.productionAdmission.slice053Admitted, true);
    assert.equal(manifest.productionAdmission.frozenQueueComplete, true);
  }
});

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_ADMISSION,
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID,
  applyG3BU04GlobalContextProductionAdmission,
  validateG3BU04GlobalContextProductionQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-production-admission.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256,
  G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION,
  auditG3BU04GlobalContextProductionRegistry
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-production-registry.js";
import {
  generateBatchABrowserQuestions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js";
import {
  validateBatchABrowserQuestions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s57f5-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s73-extension.js";

const SOURCE_ID = "g3b_u04_3b04";
const KP_ID = "kp_g3b_u04_add_then_divide";
const EXPECTED_PHRASES = ["班級園遊會", "戶外學習", "運動練習", "社區清潔活動", "露營活動"];
const LEGACY_PATTERN = /三明治費用|果汁費用|筆記本費用|彩色筆費用|門票費用|帳篷租金/;
const PUBLIC_EVIDENCE_PATH = "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.json";
const PUBLIC_MANIFEST_PATH = "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.manifest.json";
const CLAIM_PATH = "data/project/milestones/GCTX-P13.claim.json";

function applicationGroupId() {
  return getVisiblePatternGroupsForKnowledgePoint(KP_ID)
    .find((group) => group.representationTag === "application_word_problem")
    ?.patternGroupId;
}

function publicOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [applicationGroupId()],
    questionCount: 25,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "gctx-p13-public-production",
    printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true },
    ...overrides
  };
}

function targetQuestions(result) {
  return (result.questions ?? result.worksheetDocument?.generatedQuestions ?? [])
    .filter((question) => question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID);
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("GCTX-P13 records exact Human Review approval and activates the production registry", () => {
  const audit = auditG3BU04GlobalContextProductionRegistry();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.equal(audit.counts.approvedVariants, 5);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.decision, "approve_all");
  assert.equal(G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.semanticReviewApproved, true);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.mathematicalReviewApproved, true);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.operatorStatement, "五題全部核准，進入 P13。");
  assert.equal(G3B_U04_GLOBAL_CONTEXT_REVIEW_DECISION.reviewArtifactSha256, G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.productionSelectable, true);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.publicQuerySelectable, true);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.productionAdmitted, true);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PRODUCTION_LIFECYCLE.productionUse, "allowed");
});

test("GCTX-P13 E5 production evidence, manifest and Claim preserve one exact SHA-256 chain", () => {
  const manifest = JSON.parse(readFileSync(PUBLIC_MANIFEST_PATH, "utf8"));
  const claim = JSON.parse(readFileSync(CLAIM_PATH, "utf8"));
  const evidenceSha256 = sha256File(PUBLIC_EVIDENCE_PATH);
  const manifestSha256 = sha256File(PUBLIC_MANIFEST_PATH);
  const claimHash = (path) => claim.evidence.artifactHashes.find((entry) => entry.path === path)?.sha256;

  assert.equal(manifest.evidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(manifest.evidenceHashChainVerified, true);
  assert.equal(manifest.productionEvidenceSha256, evidenceSha256);
  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(claimHash(PUBLIC_EVIDENCE_PATH), evidenceSha256);
  assert.equal(claimHash(PUBLIC_MANIFEST_PATH), manifestSha256);
});

test("GCTX-P13 public canonical generator exposes all five approved contexts", () => {
  const result = generateBatchABrowserQuestions(publicOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 25);
  assert.equal(result.productionAdmission.productionAdmitted, true);
  assert.equal(result.productionAdmission.publicQuerySelectable, true);
  assert.equal(result.productionAdmission.projectedQuestionCount, 5);
  assert.equal(result.productionAdmission.uniqueVariantCount, 5);

  const targets = targetQuestions(result);
  assert.equal(targets.length, 5);
  assert.equal(new Set(targets.map((question) => question.globalContextProduction.semanticVariantId)).size, 5);
  const visibleText = targets.map((question) => question.promptText).join("\n");
  for (const phrase of EXPECTED_PHRASES) assert.match(visibleText, new RegExp(phrase));
  assert.doesNotMatch(visibleText, LEGACY_PATTERN);

  for (const question of targets) {
    assert.equal(question.phase, "GCTX-P13");
    assert.equal(question.selectorStatus, "visible");
    assert.equal(question.visibilityStatus, "visible");
    assert.equal(question.productionUse, "allowed");
    assert.equal(question.globalContextProduction.productionSelectable, true);
    assert.equal(question.globalContextProduction.publicQuerySelectable, true);
    assert.equal(question.globalContextProduction.productionAdmitted, true);
    assert.equal(question.globalContextProduction.reviewArtifactSha256, G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256);
    assert.equal(question.generatorRouting, "canonical_resolver_allocation");
    assert.equal(question.canonicalRoute.resolver, "visiblePatternGroupResolver");
    assert.equal(question.canonicalRoute.globalContextProductionAdmission, true);
    assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
    assert.equal(question.globalContextProduction.validatorAuthorityContextDomain, question.contextDomain);
    assert.equal(validateG3BU04GlobalContextProductionQuestion(question).ok, true);
  }

  const blocking = validateBatchABrowserQuestions(result.questions, { plan: result.plan });
  assert.equal(blocking.ok, true, JSON.stringify(blocking.errors));
  const targetStages = blocking.stages.filter(({ questionIndex }) =>
    result.questions[questionIndex].patternSpecId === G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID
  );
  assert.equal(targetStages.length, 5);
  assert.equal(targetStages.every(({ stages }) => stages.some((stage) =>
    stage.stage === "gctx_p13_production_admission" && stage.ok === true
  )), true);
  assert.equal(targetStages.every(({ stages }) => stages.some((stage) =>
    stage.stage === "gctx_p13_reviewed_prompt_compatibility"
      && stage.ok === true
      && stage.applied === true
      && stage.resolvedErrorCodes.includes("G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR")
  )), true);
});

test("GCTX-P13 public production output is deterministic and rotates by seed", () => {
  const first = generateBatchABrowserQuestions(publicOptions({ generationSeed: "p13-seed-one" }));
  const replay = generateBatchABrowserQuestions(publicOptions({ generationSeed: "p13-seed-one" }));
  const second = generateBatchABrowserQuestions(publicOptions({ generationSeed: "p13-seed-two" }));
  assert.equal(first.ok, true);
  assert.equal(replay.ok, true);
  assert.equal(second.ok, true);
  assert.deepEqual(targetQuestions(first), targetQuestions(replay));
  assert.notDeepEqual(
    targetQuestions(first).map((question) => question.globalContextProduction.semanticVariantId),
    targetQuestions(second).map((question) => question.globalContextProduction.semanticVariantId)
  );
});

test("GCTX-P13 validator blocks math, review, lifecycle and canonical-route drift", () => {
  const result = generateBatchABrowserQuestions(publicOptions());
  assert.equal(result.ok, true);
  const approved = targetQuestions(result)[0];

  const mutations = [
    ["GCTX_P13_MATHEMATICAL_WITNESS_INVALID", (question) => {
      question.finalAnswer += 1;
      question.answerText = `${question.finalAnswer}元`;
    }],
    ["GCTX_P13_REVIEW_EVIDENCE_MISSING", (question) => {
      question.globalContextProduction.reviewArtifactSha256 = "0".repeat(64);
    }],
    ["GCTX_P13_PRODUCTION_LIFECYCLE_INVALID", (question) => {
      question.globalContextProduction.productionAdmitted = false;
    }],
    ["GCTX_P13_CANONICAL_ROUTE_INVALID", (question) => {
      question.canonicalRoute.publicHiddenModeFlagUsed = true;
    }],
    ["GCTX_P13_PROMPT_BINDING_MISMATCH", (question) => {
      question.promptText = "未核准的情境文字？";
    }]
  ];

  for (const [expectedCode, mutate] of mutations) {
    const changed = structuredClone(approved);
    mutate(changed);
    const validation = validateG3BU04GlobalContextProductionQuestion(changed);
    assert.equal(validation.ok, false, expectedCode);
    assert.equal(validation.errors.some((entry) => entry.code === expectedCode), true, JSON.stringify(validation.errors));
  }
});

test("GCTX-P13 public worksheet and production renderer carry five contexts and answer key", () => {
  const result = buildBatchABrowserWorksheetDocument(publicOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.productionUse, "allowed");
  assert.equal(document.visibilityStatus, "visible");
  assert.equal(document.rendererProfile.profileId, "g3b_u04_semantic_long_text_v1");
  assert.equal(document.globalContextProductionAdmission.productionAdmitted, true);
  assert.equal(document.semanticSummary.globalContextProductionQuestionCount, 5);
  assert.equal(document.semanticSummary.globalContextVariantCount, 5);
  assert.equal(document.provenance.humanReviewArtifactSha256, G3B_U04_GLOBAL_CONTEXT_REVIEW_ARTIFACT_SHA256);
  assert.equal(targetQuestions(result).length, 5);
  assert.equal(document.answerKeyItems.filter((item) =>
    item.patternId === G3B_U04_GLOBAL_CONTEXT_PRODUCTION_PATTERN_SPEC_ID
  ).length, 5);

  const html = renderWorksheetDocumentToHtml(document, {
    title: "G3B-U04 P13 Public Production",
    stylesheetHref: "",
    debugDataAttributes: false
  });
  for (const phrase of EXPECTED_PHRASES) assert.match(html, new RegExp(phrase));
  assert.doesNotMatch(
    targetQuestions(result).map((question) => question.promptText).join("\n"),
    LEGACY_PATTERN
  );
  assert.match(html, /data-renderer-profile="g3b_u04_semantic_long_text_v1"/);
  assert.match(html, /算式：/);
  assert.match(html, /答案：/);
});

test("GCTX-P13 admission is a no-op outside the approved G3B-U04 canonical route", () => {
  const original = {
    ok: true,
    plan: { sourceId: "g3a_u01_3a01", routeKind: "legacy" },
    questions: [{ id: "unrelated-1", patternSpecId: "ps_unrelated" }],
    errors: [],
    warnings: []
  };
  const projected = applyG3BU04GlobalContextProductionAdmission(original, original.plan);
  assert.equal(projected, original);
  assert.equal(projected.productionAdmission, undefined);
});

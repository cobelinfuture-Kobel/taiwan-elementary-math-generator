import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGctxP11ReferenceAdmissionAndReviewGate,
  loadGctxP11Contract,
} from "../../tools/curriculum/build-gctx-p11-g3b-u04-reference-admission-review-gate.mjs";

const contract = loadGctxP11Contract();
const gate = buildGctxP11ReferenceAdmissionAndReviewGate();

test("GCTX-P11 remains candidate admission and review preparation only", () => {
  assert.equal(contract.task, "GCTX-P11_G3BU04CandidateReferenceRegistryAdmissionAndReviewGate");
  assert.equal(contract.scope.bindingCount, 117);
  assert.equal(contract.scope.humanReviewExecuted, false);
  assert.equal(contract.scope.runtimeBehaviorChanged, false);
  assert.equal(contract.scope.formalApprovedRegistryChanged, false);
  assert.equal(contract.scope.productionSelectable, false);
  assert.deepEqual(gate.scopeBoundary, {
    runtimeBehaviorChanged: false,
    formalApprovedRegistryChanged: false,
    productionSelectable: false,
    humanReviewExecuted: false,
    rendererChanged: false,
  });
});

test("GCTX-P11 resolves every candidate binding reference", () => {
  assert.deepEqual(gate.errors, []);
  assert.equal(gate.status, "accepted_for_human_review_execution");
  assert.equal(gate.summary.readyForHumanReviewExecution, true);
  assert.equal(gate.summary.bindingCount, 117);
  assert.equal(gate.summary.contextFamilyCount, 32);
  assert.equal(gate.summary.semanticVariantCount, 117);
  assert.equal(gate.summary.languageVariantCount, 117);
  assert.equal(gate.summary.numericProfileCount, 32);
  assert.equal(gate.summary.crossRegistryUnresolvedCount, 0);
  assert.equal(gate.summary.errorCount, 0);
  assert.ok(gate.summary.commonKnowledgeCount > 0);
  assert.ok(gate.summary.answerUnitCount > 0);
});

test("GCTX-P11 candidate registries have unique IDs, provenance and consumers", () => {
  for (const [name, rows] of Object.entries(gate.registries)) {
    assert.ok(rows.length > 0, name);
    assert.equal(new Set(rows.map((row) => row.id)).size, rows.length, name);
    for (const row of rows) {
      assert.equal(row.lifecycleStatus, "candidate");
      assert.equal(row.approvalState, "candidate");
      assert.equal(row.productionSelectable, false);
      assert.equal(row.runtimeResolvable, false);
      assert.ok(row.consumerBindingIds.length > 0);
      assert.ok(row.consumerPatternSpecIds.length > 0);
      assert.ok(row.sourceEvidenceIds.length > 0);
    }
  }
  assert.equal(gate.registries.contextFamilies.length, 32);
  assert.equal(gate.registries.semanticVariants.length, 117);
  assert.equal(gate.registries.languageVariants.length, 117);
  assert.equal(gate.registries.numericProfiles.length, 32);
});

test("GCTX-P11 creates one closed human review packet per binding", () => {
  assert.equal(gate.reviewPackets.length, 117);
  assert.equal(new Set(gate.reviewPackets.map((row) => row.reviewPacketId)).size, 117);
  assert.equal(new Set(gate.reviewPackets.map((row) => row.bindingId)).size, 117);
  assert.equal(gate.summary.humanSemanticReviewPendingCount, 117);
  assert.equal(gate.summary.humanMathematicalReviewPendingCount, 117);

  for (const packet of gate.reviewPackets) {
    assert.equal(packet.semanticReview.status, "pending_human_review");
    assert.equal(packet.mathematicalReview.status, "pending_human_review");
    assert.equal(packet.semanticReview.reviewerId, null);
    assert.equal(packet.mathematicalReview.reviewerId, null);
    assert.equal(packet.semanticReview.reviewEvidenceId, null);
    assert.equal(packet.mathematicalReview.reviewEvidenceId, null);
    assert.equal(packet.semanticReview.decision, null);
    assert.equal(packet.mathematicalReview.decision, null);
    assert.deepEqual(Object.keys(packet.semanticReview.checks), contract.reviewGate.semanticChecks);
    assert.deepEqual(Object.keys(packet.mathematicalReview.checks), contract.reviewGate.mathematicalChecks);
    assert.ok(Object.values(packet.semanticReview.checks).every((value) => value === "pending"));
    assert.ok(Object.values(packet.mathematicalReview.checks).every((value) => value === "pending"));
    assert.equal(packet.blockingUntilBothApproved, true);
    assert.equal(packet.productionSelectable, false);
    assert.equal(packet.runtimeResolvable, false);
  }
});

test("GCTX-P11 makes no approval or production claim", () => {
  assert.equal(gate.summary.approvedReferenceCount, 0);
  assert.equal(gate.summary.approvedBindingCount, 0);
  assert.equal(gate.summary.formalApprovedRegistryEntryCount, 0);
  assert.equal(gate.formalApprovedRegistry.entryCount, 0);
  assert.equal(gate.formalApprovedRegistry.changedByP11, false);
});

test("GCTX-P11 exposes human review execution as the next blocked step", () => {
  assert.equal(
    gate.nextShortestStep,
    "GCTX-P12_G3BU04HumanSemanticAndMathematicalReviewExecution",
  );
});

test("GCTX-P11 readback", () => {
  console.log(`GCTX_P11_REFERENCE_REVIEW_GATE_SUMMARY=${JSON.stringify(gate.summary)}`);
  assert.equal(gate.summary.errorCount, 0);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/contracts/S60A_G5A_U08_ExistingOverlayVsPDF29PanelDiffAudit.json",
  import.meta.url,
);

function loadContract() {
  return JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
}

test("S60A accounts for all 29 PDF panels and preserves the numeric/application split", () => {
  const contract = loadContract();
  const evidenceIds = contract.sourceEvidence.map((row) => row.evidenceId);
  const numericRows = contract.sourceEvidence.filter((row) => row.questionMode === "numeric");
  const applicationRows = contract.sourceEvidence.filter((row) => row.questionMode === "application");

  assert.equal(contract.source.pageCount, 3);
  assert.equal(contract.source.sha256, "dd6757be46e6cebd41303b2ebb61c63d282d59ab59731f264bf738a9f2eee9be");
  assert.equal(contract.sourceEvidence.length, 29);
  assert.equal(new Set(evidenceIds).size, 29);
  assert.equal(numericRows.length, 16);
  assert.equal(applicationRows.length, 13);
  assert.equal(contract.acceptance.allSourcePanelsAccountedFor, true);
});

test("S60A defines 11 mathematical KPs and maps every KP to source evidence", () => {
  const contract = loadContract();
  const kpIds = contract.proposedKnowledgePoints.map((row) => row.knowledgePointId);
  const evidenceIds = new Set(contract.sourceEvidence.map((row) => row.evidenceId));

  assert.equal(contract.proposedKnowledgePoints.length, 11);
  assert.equal(new Set(kpIds).size, 11);
  for (const kp of contract.proposedKnowledgePoints) {
    assert.ok(kp.sourceEvidenceIds.length > 0, `${kp.knowledgePointId} should have evidence`);
    for (const evidenceId of kp.sourceEvidenceIds) {
      assert.equal(evidenceIds.has(evidenceId), true, `${evidenceId} should exist`);
    }
  }

  for (const evidence of contract.sourceEvidence) {
    assert.ok(evidence.knowledgePointIds.length > 0, `${evidence.evidenceId} should map to a KP`);
    for (const kpId of evidence.knowledgePointIds) {
      assert.equal(kpIds.includes(kpId), true, `${kpId} should be proposed`);
    }
  }
});

test("S60A explicitly reconciles every historical S43E13 row without silent deletion", () => {
  const contract = loadContract();
  const historicalIds = contract.historicalOverlayDiff.map((row) => row.historicalKnowledgePointId);

  assert.equal(contract.historicalOverlay.knowledgePointCount, 11);
  assert.equal(contract.historicalOverlayDiff.length, 11);
  assert.equal(new Set(historicalIds).size, 11);
  assert.equal(contract.acceptance.historicalRowsAccountedFor, 11);
  assert.equal(contract.acceptance.silentHistoricalDeletionCount, 0);
  assert.equal(contract.historicalOverlay.directPromotionAllowed, false);

  const genericWordProblemRow = contract.historicalOverlayDiff.find(
    (row) => row.historicalKnowledgePointId === "kp_g5a_u08_word_problem_four_ops",
  );
  const multiStepRow = contract.historicalOverlayDiff.find(
    (row) => row.historicalKnowledgePointId === "kp_g5a_u08_multi_step_context",
  );
  assert.equal(genericWordProblemRow.action, "reclassify");
  assert.equal(genericWordProblemRow.targetLayer, "PatternGroup.application");
  assert.equal(multiStepRow.targetLayer, "SemanticTemplateFamily.N_PLUS_1");
});

test("S60A locks N+1 and SDG as semantic policy rather than mathematical KPs", () => {
  const contract = loadContract();
  const kpNames = contract.proposedKnowledgePoints.map((row) => row.displayName).join(" ");

  assert.equal(contract.scopeLock.defaultApplicationDepth, "N_PLUS_1");
  assert.equal(contract.scopeLock.maxSemanticDeltaPerItem, 1);
  assert.equal(contract.applicationPolicy.sdgRole, "semantic_context_layer");
  assert.equal(contract.applicationPolicy.sdgSourceStatus, "system_expansion_not_direct_pdf_evidence");
  assert.equal(contract.acceptance.genericApplicationKnowledgePointCount, 0);
  assert.doesNotMatch(kpNames, /應用題|SDG|情境/);
});

test("S60A records source wording corrections for illegal subtraction and division laws", () => {
  const contract = loadContract();
  const correctedRows = contract.sourceEvidence.filter((row) => row.sourceWordingCorrection);
  const corrections = correctedRows.map((row) => row.sourceWordingCorrection).join(" ");

  assert.equal(correctedRows.length, 2);
  assert.match(corrections, /Subtraction itself is not associative/);
  assert.match(corrections, /Division is not commutative or associative/);
});

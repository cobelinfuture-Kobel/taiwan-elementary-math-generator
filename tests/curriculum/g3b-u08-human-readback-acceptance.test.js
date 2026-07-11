import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const auditPath = "data/curriculum/validation/S58E_G3B_U08_HumanSemanticReadbackAudit.json";
const compactPath = "docs/curriculum/output/S58E_G3B_U08_HUMAN_READBACK_COMPACT.tsv";
const acceptancePath = "data/curriculum/validation/S58E_G3B_U08_HumanSemanticReadbackAcceptance.json";

const auditBuffer = readFileSync(auditPath);
const compactBuffer = readFileSync(compactPath);
const audit = JSON.parse(auditBuffer.toString("utf8"));
const acceptance = JSON.parse(readFileSync(acceptancePath, "utf8"));

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, "utf8");
  return createHash("sha1").update(header).update(buffer).digest("hex");
}

test("S58E human readback acceptance is pinned to the exact reviewed evidence", () => {
  assert.equal(acceptance.status, "human_readback_accepted");
  assert.equal(acceptance.reviewedArtifacts.auditGitBlobSha, gitBlobSha(auditBuffer));
  assert.equal(acceptance.reviewedArtifacts.compactEvidenceGitBlobSha, gitBlobSha(compactBuffer));
  assert.equal(acceptance.reviewedArtifacts.auditPath, auditPath);
  assert.equal(acceptance.reviewedArtifacts.compactEvidencePath, compactPath);
});

test("S58E acceptance covers every one of the 72 reviewed context records", () => {
  assert.equal(audit.records.length, 72);
  assert.equal(acceptance.coverage.contextVariantCount, 72);
  assert.equal(acceptance.coverage.acceptedRecordCount, 72);
  assert.equal(acceptance.coverage.rejectedRecordCount, 0);
  assert.equal(acceptance.coverage.remainingBlockingDefectCount, 0);
  assert.deepEqual(
    acceptance.acceptedRecordNumbers,
    Array.from({ length: 72 }, (_, index) => index + 1)
  );
  assert.equal(new Set(audit.records.map((record) => record.contextVariantId)).size, 72);
});

test("S58E accepted evidence has full automatic validation and human precheck coverage", () => {
  assert.equal(audit.coverage.knowledgePointCount, 6);
  assert.equal(audit.coverage.patternGroupCount, 6);
  assert.equal(audit.coverage.patternSpecCount, 24);
  assert.equal(audit.coverage.templateFamilyCount, 24);
  assert.equal(audit.coverage.automaticValidationPassCount, 72);
  assert.equal(audit.coverage.humanPrecheckPassCount, 72);
  for (const record of audit.records) {
    assert.equal(record.automaticValidation.valid, true, record.contextVariantId);
    assert.equal(record.automaticValidation.blockingErrorCount, 0, record.contextVariantId);
    assert.equal(record.automaticValidation.stagePassCount, 8, record.contextVariantId);
    assert.equal(record.humanPrecheck.pass, true, record.contextVariantId);
  }
});

test("S58E same-price accepted records explicitly connect total amount to better value", () => {
  const comparisons = audit.records.filter(
    (record) => record.knowledgePointId === "kp_g3b_u08_same_price_value_comparison"
  );
  assert.equal(comparisons.length, 12);
  for (const record of comparisons) {
    assert.match(record.promptText, /價格相同/);
    assert.match(record.promptText, /比較划算/);
    assert.match(record.answerText, /比較划算/);
  }
});

test("S58E acceptance remains hidden and delegates public promotion to S58F", () => {
  assert.equal(acceptance.nextGate, "S58F_G3B_U08_PromotionLifecycleAndVisibleSelectorProjection");
  assert.match(acceptance.scopeLimit, /Selector/);
  assert.match(acceptance.scopeLimit, /production promotion/);
});

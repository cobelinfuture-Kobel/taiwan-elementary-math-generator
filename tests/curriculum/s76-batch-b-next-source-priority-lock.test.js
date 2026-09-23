import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const LOCK_PATH = new URL(
  "../../data/curriculum/registry/S76_BatchB_NextSourcePriorityLock.json",
  import.meta.url,
);
const lock = JSON.parse(readFileSync(LOCK_PATH, "utf8"));

test("S76 locks the S61 priority-2 factor source after G4B-U04 D0", () => {
  assert.equal(lock.task, "S76_BatchB_NextSourcePriorityLock");
  assert.equal(lock.mode, "planning_only");
  assert.equal(lock.completedSource.sourceId, "g4b_u04_4b04");
  assert.equal(lock.completedSource.distance, "D0_G4B_U04_PRODUCTION_READY_AND_CLOSED");
  assert.equal(lock.lockedNextSource.priority, 2);
  assert.equal(lock.lockedNextSource.wave, "B1");
  assert.equal(lock.lockedNextSource.sourceId, "g5a_u02_5a02a");
  assert.equal(lock.lockedNextSource.sourceTitle, "因數");
});

test("S76 records source readiness without claiming visual extraction", () => {
  assert.equal(lock.lockedNextSource.sourceFile, "meow911_5a02a_source.pdf");
  assert.equal(lock.lockedNextSource.originalFileName, "題型總覽-5a02a-因數.pdf");
  assert.equal(lock.lockedNextSource.driveFileId, "1950HYCXtP6qeBvCiRqTeEgLWwpSxKvgk");
  assert.equal(lock.lockedNextSource.sourceStored, true);
  assert.equal(lock.lockedNextSource.manualReviewed, false);
  assert.equal(lock.lockedNextSource.extractionStatus, "pending");
  assert.equal(lock.authority.ocrAuthority, "forbidden");
});

test("S76 preserves 5a02a1 as the next distinct split packet", () => {
  assert.equal(lock.pairedFollowUpSource.priority, 3);
  assert.equal(lock.pairedFollowUpSource.sourceId, "g5a_u02_5a02a1");
  assert.equal(lock.pairedFollowUpSource.relationship, "split_source_packet");
  assert.equal(lock.pairedFollowUpSource.mergeIntoLockedNextSource, false);
});

test("S76 rejects a learner-facing Batch A/Batch B switch", () => {
  const publicCatalog = lock.publicCatalogDecision;
  assert.equal(publicCatalog.batchABatchBToggle, false);
  assert.equal(publicCatalog.decision, "neutral_public_catalog_labels");
  assert.equal(publicCatalog.keepInterfaceStyleToggle, true);
  assert.deepEqual(publicCatalog.interfaceStyleOptions, ["Classic", "Pixel Beta"]);
  assert.deepEqual(publicCatalog.recommendedCurriculumFilters, ["年級", "學期", "單元"]);
  assert.equal(publicCatalog.recommendedPublicLabels.heroTitle, "台灣小學數學練習題產生器");
  assert.equal(publicCatalog.recommendedPublicLabels.unitSectionHeading, "單元選擇");
});

test("S76 remains planning-only and defines finite handoff tasks", () => {
  assert.equal(Object.values(lock.scopeBoundary).every((value) => value === false), true);
  assert.deepEqual(lock.handoff.executionOrder, [
    "S77_PublicCatalogNeutralNamingAndBatchBoundaryFullFix",
    "S78_G5A_U02A_ManualPDFKnowledgePointExtraction",
  ]);
  assert.equal(lock.goalDistance.after, "D4_BATCH_B_NEXT_SOURCE_AND_PUBLIC_CATALOG_POLICY_LOCKED");
  assert.equal(lock.goalDistance.nextShortestStep, "S77_PublicCatalogNeutralNamingAndBatchBoundaryFullFix");
  assert.equal(lock.goalDistance.stopReason, "PLANNING_TO_IMPLEMENTATION_APPROVAL_REQUIRED");
});

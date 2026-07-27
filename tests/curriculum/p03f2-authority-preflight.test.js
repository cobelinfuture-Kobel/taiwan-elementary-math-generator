import test from "node:test";
import assert from "node:assert/strict";
import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeSharedW02WorksheetProjection } from "../../src/curriculum/application/shared/worksheet-projection-runtime.mjs";

test("P03F2 read-only authority preflight", () => {
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[1];
  const ids = new Set([
    "ps_g3a_u08_unit_fraction_accumulation_fraction_application",
    "ps_g3a_u08_discrete_set_fraction_item_count_application",
    "ps_g3a_u08_discrete_set_fraction_fractional_units_application",
  ]);
  const projection = materializeSharedW02WorksheetProjection();
  const applicationRecords = projection.applicationQuestionRecords
    .filter((row) => ids.has(row.patternSpecId))
    .map((row) => ({
      applicationQuestionRecordId: row.applicationQuestionRecordId,
      sourceNodeId: row.sourceNodeId,
      knowledgePointId: row.knowledgePointId,
      patternSpecId: row.patternSpecId,
      bindingCandidateId: row.bindingCandidateId,
      proofCandidateId: row.proofCandidateId,
      promptZh: row.promptZh,
      contextLineage: row.contextLineage,
      answerShape: row.answerShape,
      capabilityType: row.capabilityType,
      validatorEvidence: row.validatorEvidence,
    }));
  console.log("P03F2_AUTHORITY_READBACK=" + JSON.stringify({ slice, applicationRecords }));
  assert.equal(slice.queuePosition, 2);
  assert.deepEqual(slice.knowledgePointIds, [
    "kp_g3a_u08_discrete_set_fraction",
    "kp_g3a_u08_unit_fraction_accumulation",
  ]);
  assert.equal(applicationRecords.length, 3);
});

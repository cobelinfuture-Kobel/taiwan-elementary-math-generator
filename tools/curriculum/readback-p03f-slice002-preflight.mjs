import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeSharedW02WorksheetProjection } from "../../src/curriculum/application/shared/worksheet-projection-runtime.mjs";

const queue = materializeP03EW3DirectProductVerticalSliceQueue();
const slice = queue.queueEntries[1];
if (!slice || slice.queuePosition !== 2) throw new Error("P03F2_QUEUE_POSITION_2_MISSING");
const targetPatternSpecIds = new Set([
  "ps_g3a_u08_unit_fraction_accumulation_fraction_application",
  "ps_g3a_u08_discrete_set_fraction_item_count_application",
  "ps_g3a_u08_discrete_set_fraction_fractional_units_application",
]);
const projection = materializeSharedW02WorksheetProjection();
const applicationRecords = projection.applicationQuestionRecords
  .filter((row) => targetPatternSpecIds.has(row.patternSpecId))
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
console.log(JSON.stringify({
  slice,
  queueDigest: queue.queueRegistry?.queueDigest,
  applicationRecords,
}, null, 2));
if (slice.knowledgePointIds.length !== 2) throw new Error(`P03F2_KP_COUNT_INVALID:${slice.knowledgePointIds.length}`);
if (applicationRecords.length !== 3) throw new Error(`P03F2_APPLICATION_RECORD_COUNT_INVALID:${applicationRecords.length}`);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const resolution = JSON.parse(fs.readFileSync(path.join(ROOT, "data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-current-integration-path-resolution.json"), "utf8"));
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const row = queue.queueEntries.find((entry) => entry.queuePosition === 29);
if (!row) throw new Error("P05F29_QUEUE_ROW_MISSING");
if (row.sliceId !== resolution.queueAuthority.sliceId) throw new Error("P05F29_SLICE_ID_MISMATCH");
if (row.primarySourceNodeId !== resolution.queueAuthority.primarySourceNodeId) throw new Error("P05F29_SOURCE_ID_MISMATCH");
if (row.primaryRuntimeProfileId !== resolution.queueAuthority.primaryRuntimeProfileId) throw new Error("P05F29_RUNTIME_PROFILE_MISMATCH");
if (JSON.stringify(row.knowledgePointIds) !== JSON.stringify(resolution.queueAuthority.knowledgePointIds)) throw new Error("P05F29_KP_MISMATCH");

console.log(JSON.stringify({
  status: resolution.status,
  queuePosition: row.queuePosition,
  sliceId: row.sliceId,
  sourceId: row.primarySourceNodeId,
  runtimeProfileId: row.primaryRuntimeProfileId,
  knowledgePointIds: row.knowledgePointIds,
  currentSelectorExtension: resolution.currentIntegrationBaseline.currentSelectorExtension,
  currentPublicCapabilityBinding: resolution.currentIntegrationBaseline.currentPublicCapabilityBinding,
  currentWorksheetEntry: resolution.currentIntegrationBaseline.currentWorksheetEntry,
  selectorStrategy: resolution.integrationDecision.selectorStrategy,
  generatorStrategy: resolution.integrationDecision.generatorStrategy,
  worksheetStrategy: resolution.integrationDecision.worksheetStrategy,
  rendererStrategy: resolution.integrationDecision.rendererStrategy,
  sourceUnitOwnershipKnowledgePointId: resolution.integrationDecision.sourceUnitOwnershipKnowledgePointId,
  q028RendererDirectSemanticReuseAllowed: resolution.integrationDecision.q028RendererDirectSemanticReuseAllowed,
  nextTask: resolution.nextTask
}, null, 2));

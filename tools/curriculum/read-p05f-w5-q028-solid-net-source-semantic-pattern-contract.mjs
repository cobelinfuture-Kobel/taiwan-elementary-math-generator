import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const contract = readJson("data/curriculum/full-product/p05f/q028-g5a-u10a-solid-net-source-semantic-pattern-contract.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const queue = materializeP05EW5DirectProductVerticalSliceQueue();
const q028 = queue.queueEntries.find((entry) => entry.queuePosition === 28);
const q029 = queue.queueEntries.find((entry) => entry.queuePosition === 29);
const source = r02.sourceRecords.find((record) => record.sourceNodeId === q028?.primarySourceNodeId);
const candidate = source?.candidates?.find((item) => item.knowledgePointId === q028?.knowledgePointIds?.[0]);

if (!q028 || !q029 || !source || !candidate) throw new Error("P05F28_SOURCE_PATTERN_AUTHORITY_MISSING");
if (candidate.capabilityStatement !== contract.r02ReviewedCandidateAuthority.capabilityStatement) throw new Error("P05F28_CAPABILITY_STATEMENT_MISMATCH");
if (candidate.reasoningInvariant !== contract.r02ReviewedCandidateAuthority.reasoningInvariant) throw new Error("P05F28_REASONING_INVARIANT_MISMATCH");
if (!q029.knowledgePointIds.includes(contract.semanticContract.deferredKnowledgePointId)) throw new Error("P05F28_Q029_DEFERRED_KP_MISMATCH");

console.log(JSON.stringify({
  status: contract.status,
  queuePosition: q028.queuePosition,
  sliceId: q028.sliceId,
  sourceId: q028.primarySourceNodeId,
  knowledgePointId: q028.knowledgePointIds[0],
  canonicalNameZh: candidate.canonicalNameZh,
  capabilityStatement: candidate.capabilityStatement,
  reasoningInvariant: candidate.reasoningInvariant,
  reviewedPages: contract.sourceAuthority.reviewedPages,
  admittedSolidFamilies: contract.semanticContract.admittedSolidFamilies,
  deferredToQ029: contract.semanticContract.explicitlyDeferredSolidFamilies,
  patternSpecIds: contract.patternContract.patternSpecs.map((spec) => spec.patternSpecId),
  validatorName: contract.validatorContract.validatorName,
  nextTask: contract.nextTask
}, null, 2));

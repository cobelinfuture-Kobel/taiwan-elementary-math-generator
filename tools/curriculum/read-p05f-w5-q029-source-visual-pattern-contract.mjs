import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const contract = readJson("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-visual-pattern-contract.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const queue = materializeP05EW5DirectProductVerticalSliceQueue();

if (!queue.queueFrozen || !queue.queueRegistryParity) throw new Error("Q029_QUEUE_AUTHORITY_NOT_FROZEN");
const row = queue.queueEntries.find((entry) => entry.queuePosition === 29);
if (!row) throw new Error("Q029_ROW_MISSING");
if (row.knowledgePointIds.length !== 1 || row.knowledgePointIds[0] !== "kp_g5a_u10a1_cube_cuboid_net") throw new Error("Q029_KP_MISMATCH");
if (contract.sourceAuthority.sourcePdfDriveFileId !== "1LVpCn7I1t17SpWbwCXLfHjghTBQ7lwL5") throw new Error("Q029_SOURCE_PDF_ID_MISMATCH");

const source = r02.sourceRecords.find((entry) => entry.sourceNodeId === row.primarySourceNodeId);
const candidate = source?.candidates.find((entry) => entry.knowledgePointId === row.knowledgePointIds[0]);
if (!candidate) throw new Error("Q029_R02_CANDIDATE_MISSING");

const report = {
  schemaName: "P05FW5Q029SourceVisualPatternReadbackV1",
  status: "PASS_Q029_SOURCE_VISUAL_PATTERN_CONTRACT",
  queue: {
    queuePosition: row.queuePosition,
    sliceId: row.sliceId,
    sourceNodeId: row.primarySourceNodeId,
    runtimeProfileId: row.primaryRuntimeProfileId,
    knowledgePointIds: row.knowledgePointIds,
    requiredW5CapabilityIds: row.requiredW5CapabilityIds,
    queueDigest: queue.derivedRegistrySnapshot.queueDigest,
  },
  source: {
    title: contract.sourceAuthority.sourceTitle,
    pdfTitle: contract.sourceAuthority.sourcePdfTitle,
    pdfDriveFileId: contract.sourceAuthority.sourcePdfDriveFileId,
    reviewedPages: contract.sourceAuthority.reviewedPages,
    reviewMethod: contract.sourceAuthority.reviewMethod,
    page1Witnesses: contract.sourceAuthority.directVisualEvidence.page1.explicitVisualWitnesses,
    page2ScopeSeparation: contract.sourceAuthority.directVisualEvidence.page2.scopeSeparationEvidence,
  },
  r02: candidate,
  patternSpecs: contract.patternContract.patternSpecs.map((entry) => ({
    patternSpecId: entry.patternSpecId,
    task: entry.task,
    evidenceClass: entry.evidenceClass,
  })),
  planningOnly: contract.implementationBoundary.implementationAllowedByThisMilestone === false,
  nextTask: contract.nextTask,
  nextTaskRequiresSeparateImplementationApproval: contract.nextTaskRequiresSeparateImplementationApproval,
};

process.stdout.write(`P05F29_SOURCE_VISUAL_PATTERN_READBACK=${JSON.stringify(report)}\n`);

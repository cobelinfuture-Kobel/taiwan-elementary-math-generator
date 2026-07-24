import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = process.cwd();
const MANIFEST_PATH = "data/curriculum/global/candidates/r02/reviewed-source-candidate-pack.manifest.json";
const OUTPUT_PATH = "tmp/r02-recovered-reviewed-source-candidate-pack.json";

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, MANIFEST_PATH), "utf8"));
const compressed = fs.readFileSync(path.join(ROOT, manifest.compressedPackPath));
const text = zlib.gunzipSync(compressed, {
  finishFlush: zlib.constants.Z_SYNC_FLUSH,
}).toString("utf8");
const pack = JSON.parse(text);
const sourceRecords = Array.isArray(pack.sourceRecords) ? pack.sourceRecords : [];
const candidateProjectionCount = sourceRecords.reduce(
  (sum, source) => sum + (Array.isArray(source.candidates) ? source.candidates.length : 0),
  0,
);
const uniqueKnowledgePointIdCount = new Set(
  sourceRecords.flatMap((source) => (source.candidates ?? []).map((row) => row.knowledgePointId)),
).size;

const expected = manifest.counts ?? {};
const checks = {
  sourceNodeCount: sourceRecords.length,
  candidateProjectionCount,
  uniqueKnowledgePointIdCount,
};

if (sourceRecords.length !== expected.sourceNodeCount
  || candidateProjectionCount !== expected.candidateProjectionCount
  || uniqueKnowledgePointIdCount !== expected.uniqueKnowledgePointIdCount) {
  throw new Error(`R02_RECOVERY_INTEGRITY_MISMATCH ${JSON.stringify({ expected, actual: checks })}`);
}

fs.mkdirSync(path.dirname(path.join(ROOT, OUTPUT_PATH)), { recursive: true });
fs.writeFileSync(path.join(ROOT, OUTPUT_PATH), `${JSON.stringify({
  schemaName: "R02RecoveredReviewedSourceCandidatePackV1",
  schemaVersion: 1,
  programId: manifest.programId,
  taskId: manifest.taskId,
  recoverySource: manifest.compressedPackPath,
  recoveryMethod: "GZIP_Z_SYNC_FLUSH_WITH_COUNT_INTEGRITY_GATE",
  counts: checks,
  sourceRecords,
}, null, 2)}\n`);

process.stdout.write(`R02_RECOVERY_PASS=${JSON.stringify(checks)}\n`);
process.stdout.write(`R02_RECOVERY_OUTPUT=${OUTPUT_PATH}\n`);

import fs from "node:fs";
import path from "node:path";
import { materializeR02GlobalKnowledgePointRegistry } from "../../src/curriculum/global/r02-global-kp-candidate-reconciliation.mjs";

const registry = materializeR02GlobalKnowledgePointRegistry();
const outputPath = path.resolve("tmp/r03-global-kp-node-snapshot.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  schemaName: "R03GlobalKnowledgePointNodeSnapshotV1",
  schemaVersion: 1,
  producerTaskId: "R03_GlobalPrerequisiteGraph",
  sourceRegistryTaskId: registry.taskId,
  counts: registry.counts,
  knowledgePoints: registry.knowledgePoints,
  sourceViews: registry.sourceViews,
}, null, 2)}\n`);

process.stdout.write(`R03_NODE_SNAPSHOT=${JSON.stringify({
  sourceNodeCount: registry.counts.sourceNodeCount,
  knowledgePointCount: registry.counts.globalKnowledgePointCount,
  conflictCount: registry.counts.semanticIdentityConflictCount,
})}\n`);
process.stdout.write(`R03_NODE_SNAPSHOT_PATH=${path.relative(process.cwd(), outputPath).replaceAll("\\", "/")}\n`);

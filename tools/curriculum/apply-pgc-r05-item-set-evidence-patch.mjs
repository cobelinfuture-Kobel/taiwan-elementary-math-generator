import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "tools/curriculum/reconcile-pgc-r05-capacity-contract.mjs";
const marker = "PGC-R05 order-insensitive item-set reconciliation evidence V1";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_ITEM_SET_EVIDENCE_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

export function applyPgcR05ItemSetEvidencePatch() {
  const filePath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({ status: "PASS_PGC_R05_ITEM_SET_EVIDENCE_ALREADY_APPLIED", changedFiles: Object.freeze([]) });
    console.log(`PGC_R05_ITEM_SET_EVIDENCE_PATCH=${JSON.stringify(result)}`);
    return result;
  }

  let source = before;
  source = replaceRequired(
    source,
    `  if (!run.worksheetSignature) throw new Error(\`PGC_R05_RECONCILIATION_SIGNATURE_MISSING:\${routeId}:\${run?.seed}\`);`,
    `  if (!run.worksheetSignature) throw new Error(\`PGC_R05_RECONCILIATION_WORKSHEET_SIGNATURE_MISSING:\${routeId}:\${run?.seed}\`);
  if (!run.itemSetSignature) throw new Error(\`PGC_R05_RECONCILIATION_ITEM_SET_SIGNATURE_MISSING:\${routeId}:\${run?.seed}\`);`,
    "required-signatures",
  );

  source = replaceRequired(
    source,
    `    orderedWorksheetSignature: run.worksheetSignature,
    itemSetSignature: stableHash(JSON.stringify({
      worksheetSignature: run.worksheetSignature,
      patternSpecIdsObserved: safeArray(run.patternSpecIdsObserved),
      knowledgePointIdsObserved: safeArray(run.knowledgePointIdsObserved),
      uniquePromptCount: run.uniquePromptCount,
    })),`,
    `    orderedWorksheetSignature: run.worksheetSignature,
    itemSetSignature: run.itemSetSignature,`,
    "capacity-run-item-set",
  );

  source = replaceRequired(
    source,
    `    const signatures = unique(runs.map((run) => run.worksheetSignature));
    if (signatures.length !== runs.length) throw new Error(\`PGC_R05_CROSS_SEED_WORKSHEET_DIVERSITY_REQUIRED:\${route.routeId}\`);
    const capacityRuns = runs.map(capacityRun);`,
    `    const orderedWorksheetSignatures = unique(runs.map((run) => run.worksheetSignature));
    const itemSetSignatures = unique(runs.map((run) => run.itemSetSignature));
    if (orderedWorksheetSignatures.length !== runs.length) throw new Error(\`PGC_R05_CROSS_SEED_WORKSHEET_DIVERSITY_REQUIRED:\${route.routeId}\`);
    if (itemSetSignatures.length !== runs.length) throw new Error(\`PGC_R05_CROSS_SEED_ITEM_SET_DIVERSITY_REQUIRED:\${route.routeId}\`);
    const capacityRuns = runs.map(capacityRun);`,
    "cross-seed-item-set",
  );

  source = replaceRequired(
    source,
    `      uniqueItemSetCount: Math.max(Number(route.uniqueItemSetCount) || 0, new Set(capacityRuns.map((run) => run.itemSetSignature)).size),
      uniqueOrderedWorksheetCount: Math.max(Number(route.uniqueOrderedWorksheetCount) || 0, signatures.length),`,
    `      uniqueItemSetCount: Math.max(Number(route.uniqueItemSetCount) || 0, itemSetSignatures.length),
      uniqueOrderedWorksheetCount: Math.max(Number(route.uniqueOrderedWorksheetCount) || 0, orderedWorksheetSignatures.length),`,
    "reconciled-diversity-counts",
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);
  const result = Object.freeze({
    status: "PASS_PGC_R05_ITEM_SET_EVIDENCE_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    itemSetSignatureRequired: true,
    crossSeedItemSetDiversityRequired: true,
  });
  console.log(`PGC_R05_ITEM_SET_EVIDENCE_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05ItemSetEvidencePatch();

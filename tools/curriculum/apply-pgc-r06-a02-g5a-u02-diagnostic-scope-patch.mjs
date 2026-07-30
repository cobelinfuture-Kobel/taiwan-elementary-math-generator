import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const relativePath = "tools/curriculum/materialize-pgc-r06-a02-g5a-u02-live-diagnostics.mjs";
const filePath = path.join(repoRoot, relativePath);
const marker = "PGC-R06 A02 classify all legal G5A-U02 queue gaps V1";

function replaceRequired(source, before, after) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error("PGC_R06_A02_DIAGNOSTIC_SCOPE_PATCH_ANCHOR_MISSING");
  return source.replace(before, after);
}

export function applyPgcR06A02G5AU02DiagnosticScopePatch() {
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) {
    const result = Object.freeze({ status: "PASS_PGC_R06_A02_DIAGNOSTIC_SCOPE_ALREADY_APPLIED", changedFiles: Object.freeze([]) });
    console.log(`PGC_R06_A02_DIAGNOSTIC_SCOPE_PATCH=${JSON.stringify(result)}`);
    return result;
  }
  let source = replaceRequired(
    before,
    `  if (targets.some((route) => route.legalRoute !== true || !safeArray(route.gapCodes).includes("CAPACITY_BELOW_20"))) {\n    throw new Error("PGC_R06_A02_TARGET_SCOPE_INVALID");\n  }`,
    `  if (targets.some((route) => route.legalRoute !== true || safeArray(route.gapCodes).length === 0)) {\n    throw new Error("PGC_R06_A02_TARGET_SCOPE_INVALID");\n  }`,
  );
  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(filePath, source);
  const result = Object.freeze({
    status: "PASS_PGC_R06_A02_DIAGNOSTIC_SCOPE_PATCH_APPLIED",
    changedFiles: Object.freeze([relativePath]),
    capacityOnlyAssumptionRemoved: true,
    allLegalQueuedGapRoutesClassified: true,
  });
  console.log(`PGC_R06_A02_DIAGNOSTIC_SCOPE_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR06A02G5AU02DiagnosticScopePatch();

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const runtimeDir = path.join(repoRoot, "site/modules/curriculum/batch-a");
const markers = Object.freeze({
  "tenth-decimal-runtime.js": "PGC-R04 bounded prompt expansion",
  "hundredth-decimal-runtime.js": "PGC-R04 bounded prompt expansion",
  "equivalent-fraction-runtime.js": "PGC-R04 equivalent fraction parameter space",
  "same-denominator-fraction-compare-runtime.js": "PGC-R04 same denominator numeric parameter space",
  "discrete-fraction-conversion-runtime.js": "PGC-R04 discrete conversion numeric parameter space",
  "decimal-read-write-runtime.js": "PGC-R04 decimal read-write parameter space",
  "decimal-compose-decompose-runtime.js": "PGC-R04 decimal compose parameter space",
  "tenths-fraction-decimal-runtime.js": "PGC-R04 tenths conversion surface parameter space",
  "one-decimal-times-integer-runtime.js": "PGC-R04 decimal multiplication numeric parameter space",
  "equivalence-cross-product-cases.js": "PGC-R04 cross product parameter space",
  "quotient-as-fraction-context-runtime.js": "PGC-R04 quotient numeric parameter space",
});

function allPatched() {
  return Object.entries(markers).every(([fileName, marker]) => fs.readFileSync(path.join(runtimeDir, fileName), "utf8").includes(marker));
}

if (allPatched()) {
  console.log("PGC_R04_BOUNDED_RUNTIME_EXPANSION=ALREADY_SYNCHRONIZED");
} else {
  const { applyPgcR04BoundedRuntimeExpansionPatch } = await import("./apply-pgc-r04-bounded-runtime-expansion-patch.mjs");
  applyPgcR04BoundedRuntimeExpansionPatch();
  if (!allPatched()) throw new Error("PGC_R04_BOUNDED_RUNTIME_EXPANSION_POSTCONDITION_FAILED");
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const patcherPath = path.join(repoRoot, "tools/curriculum/apply-pgc-r04-final-legacy-producer-patch.mjs");
let source = fs.readFileSync(patcherPath, "utf8");

const embeddedRuntimeIdentifiers = [
  "largerDigitCount",
  "smallerDigitCount",
  "left",
  "right",
  "product",
  "unitFractionCount",
  "denominator",
];
const before = source;
for (const identifier of embeddedRuntimeIdentifiers) {
  source = source.replaceAll("${" + identifier + "}", "\\${" + identifier + "}");
}

if (source !== before) fs.writeFileSync(patcherPath, source);
for (const identifier of embeddedRuntimeIdentifiers) {
  if (!source.includes("\\${" + identifier + "}")) {
    throw new Error("PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE_FAILED:" + identifier);
  }
}
console.log(source === before ? "PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE=ALREADY_FIXED" : "PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE=PATCHED");

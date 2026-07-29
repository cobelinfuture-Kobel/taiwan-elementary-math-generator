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
  const pattern = new RegExp("\\\\*\\$\\{" + identifier + "\\}", "g");
  const normalized = "\\${" + identifier + "}";
  source = source.replace(pattern, () => normalized);
}

if (source !== before) fs.writeFileSync(patcherPath, source);
for (const identifier of embeddedRuntimeIdentifiers) {
  const normalized = "\\${" + identifier + "}";
  const overEscaped = "\\\\${" + identifier + "}";
  if (!source.includes(normalized) || source.includes(overEscaped)) {
    throw new Error("PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE_FAILED:" + identifier);
  }
}
console.log(source === before ? "PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE=ALREADY_FIXED" : "PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE=NORMALIZED");

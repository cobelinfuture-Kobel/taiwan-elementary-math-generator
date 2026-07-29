import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const patcherPath = path.join(repoRoot, "tools/curriculum/apply-pgc-r04-final-legacy-producer-patch.mjs");
let source = fs.readFileSync(patcherPath, "utf8");

const before = source;
source = source
  .replaceAll("${largerDigitCount}", "\\${largerDigitCount}")
  .replaceAll("${smallerDigitCount}", "\\${smallerDigitCount}");

if (source !== before) fs.writeFileSync(patcherPath, source);
if (!source.includes("\\${largerDigitCount}") || !source.includes("\\${smallerDigitCount}")) {
  throw new Error("PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE_FAILED");
}
console.log(source === before ? "PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE=ALREADY_FIXED" : "PGC_R04_FINAL_PATCHER_TEMPLATE_ESCAPE=PATCHED");

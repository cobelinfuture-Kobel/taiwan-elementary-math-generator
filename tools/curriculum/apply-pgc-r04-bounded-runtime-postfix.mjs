import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const filePath = path.join(repoRoot, "site/modules/curriculum/batch-a/same-denominator-fraction-compare-runtime.js");
const declaration = '  const authority = patternSpecId === G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID ? P03F6_APPLICATION_AUTHORITY : null;';

export function applyPgcR04BoundedRuntimePostfix() {
  let content = fs.readFileSync(filePath, "utf8");
  const occurrences = content.split(declaration).length - 1;
  if (occurrences === 2) {
    const first = content.indexOf(declaration);
    const second = content.indexOf(declaration, first + declaration.length);
    content = `${content.slice(0, second)}  // PGC-R04 duplicate authority declaration removed\n${content.slice(second + declaration.length + 1)}`;
    fs.writeFileSync(filePath, content);
  } else if (occurrences !== 1 || !content.includes("PGC-R04 duplicate authority declaration removed")) {
    throw new Error(`PGC_R04_SAME_DENOMINATOR_AUTHORITY_COUNT_INVALID:${occurrences}`);
  }
  console.log("PGC_R04_BOUNDED_RUNTIME_POSTFIX=PASS");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04BoundedRuntimePostfix();

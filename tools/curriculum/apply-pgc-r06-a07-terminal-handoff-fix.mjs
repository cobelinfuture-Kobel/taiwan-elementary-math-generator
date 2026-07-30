import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OLD_VALUE = "OPERATOR_SELECT_NEXT_APPROVED_PROGRAM_AFTER_R06";
const NEW_VALUE = "PGC-R06-A07_D0Closed_SelectNextApprovedProgram";
const marker = "PGC-R06 A07 terminal handoff compatibility";

function patch(relativePath) {
  const targetPath = path.join(repoRoot, relativePath);
  let source = fs.readFileSync(targetPath, "utf8");
  if (source.includes(marker)) return false;
  if (!source.includes(OLD_VALUE)) throw new Error(`PGC_R06_A07_TERMINAL_HANDOFF_ANCHOR_MISSING:${relativePath}`);
  source = source.replaceAll(OLD_VALUE, NEW_VALUE);
  fs.writeFileSync(targetPath, `${source.trimEnd()}\n\n// ${marker}\n`);
  return true;
}

const materializerChanged = patch("tools/curriculum/materialize-pgc-r06-a07-final-global-live-d0-closeout.mjs");
const testChanged = patch("tests/curriculum/pgc-r06-a07-final-global-live-d0-closeout.test.js");

console.log(`PGC_R06_A07_TERMINAL_HANDOFF_FIX=${JSON.stringify({
  status: materializerChanged || testChanged ? "APPLIED" : "ALREADY_APPLIED",
  nextShortestStep: NEW_VALUE,
  materializerChanged,
  testChanged,
})}`);

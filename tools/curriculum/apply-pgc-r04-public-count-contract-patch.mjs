import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const runtimeDir = path.join(repoRoot, "site/modules/curriculum/batch-a");
const TARGET_SLICE_MIN = 4;
const TARGET_SLICE_MAX = 13;
const PUBLIC_MAX = 20;

function patchFile(filePath) {
  const before = fs.readFileSync(filePath, "utf8");
  let after = before.replace(/plan\.questionCount > \d+/g, `plan.questionCount > ${PUBLIC_MAX}`);
  after = after.replace(/const maxCount = simplest \? 9 : 6;/g, `const maxCount = ${PUBLIC_MAX};`);
  if (after !== before) fs.writeFileSync(filePath, after);
  return after !== before;
}

export function applyPgcR04PublicCountContractPatch() {
  const files = fs.readdirSync(runtimeDir)
    .map((name) => {
      const match = name.match(/^batch-a-browser-validator-p03f(\d+)\.js$/);
      return match ? { name, slice: Number(match[1]) } : null;
    })
    .filter((entry) => entry && entry.slice >= TARGET_SLICE_MIN && entry.slice <= TARGET_SLICE_MAX)
    .sort((left, right) => left.slice - right.slice);

  if (files.length !== TARGET_SLICE_MAX - TARGET_SLICE_MIN + 1) {
    throw new Error(`PGC_R04_EXPECTED_VALIDATOR_CHAIN_MISSING:${files.map((entry) => entry.name).join("|")}`);
  }

  const modified = files.filter((entry) => patchFile(path.join(runtimeDir, entry.name))).map((entry) => entry.name);
  const unresolved = files.filter((entry) => {
    const content = fs.readFileSync(path.join(runtimeDir, entry.name), "utf8");
    return /plan\.questionCount > (?:[1-9]|1\d)(?!\d)/.test(content)
      || /const maxCount = simplest \? 9 : 6;/.test(content);
  });
  if (unresolved.length > 0) throw new Error(`PGC_R04_PUBLIC_COUNT_PATCH_INCOMPLETE:${unresolved.map((entry) => entry.name).join("|")}`);

  const result = {
    status: "PASS_PGC_R04_PUBLIC_COUNT_CONTRACT_PATCHED",
    publicMaxQuestionCount: PUBLIC_MAX,
    validatorFileCount: files.length,
    modifiedFiles: modified,
    preservedRules: [
      "pattern identity",
      "question mode",
      "generic fallback disabled",
      "question validator",
      "answer validator",
      "duplicate prompt rejection",
    ],
  };
  console.log(`PGC_R04_PUBLIC_COUNT_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR04PublicCountContractPatch();

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyPgcR04SeedParameterizationPatch } from "./apply-pgc-r04-seed-parameterization-patch.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const base = path.join(repoRoot, "site/modules/curriculum/batch-a");

const semanticRequirements = Object.freeze({
  "g3a-u03-quality-generator.js": Object.freeze([
    "function pairFor(specId, sequenceNumber, seed)",
    "function makeMissingQuestion(sequenceNumber, seed)",
    "pairFor(specId, sequenceNumber, seed)",
  ]),
  "g3a-u06-remainder-generator.js": Object.freeze([
    "function modelFor(sequenceNumber, seed)",
    "makeDivisionWithRemainderQuestion(sequenceNumber = 1, seed",
  ]),
  "g3a-u06-word-problem-generator.js": Object.freeze([
    "function shiftedSequence(sequenceNumber, seed, channel)",
    "makeQuotativeDivisionPackagingQuestion(sequenceNumber = 1, seed",
    "makePartitiveDivisionEqualSharingQuestion(sequenceNumber = 1, seed",
  ]),
  "g3a-u06-parity-generator.js": Object.freeze([
    "function buildParityModel(sequenceNumber, seed)",
    "makeParityRangeMissingDigitQuestion(sequenceNumber = 1, seed",
  ]),
  "g3a-u06-division-generator.js": Object.freeze([
    "makeDivisionWithRemainderQuestion(sequenceNumber, seed)",
    "makeQuotativeDivisionPackagingQuestion(sequenceNumber, seed)",
    "makePartitiveDivisionEqualSharingQuestion(sequenceNumber, seed)",
    "makeParityRangeMissingDigitQuestion(sequenceNumber, seed)",
  ]),
  "quotient-fraction-runtime.js": Object.freeze([
    "const PAIRS = Object.freeze(Array.from",
  ]),
  "simplest-fraction-runtime.js": Object.freeze([
    "function buildCases()",
    "const CASES = Object.freeze(buildCases())",
  ]),
});

function inspectSemanticState() {
  const missing = [];
  for (const [relativePath, needles] of Object.entries(semanticRequirements)) {
    const filePath = path.join(base, relativePath);
    const content = fs.readFileSync(filePath, "utf8");
    for (const needle of needles) {
      if (!content.includes(needle)) missing.push(`${relativePath}:${needle}`);
    }
  }
  return Object.freeze({ ok: missing.length === 0, missing: Object.freeze(missing) });
}

export function runPgcR04SeedParameterizationIdempotent() {
  const before = inspectSemanticState();
  if (before.ok) {
    const result = Object.freeze({
      status: "PASS_PGC_R04_SEED_PARAMETERIZATION_ALREADY_APPLIED",
      semanticFileCount: Object.keys(semanticRequirements).length,
      missing: Object.freeze([]),
    });
    console.log(`PGC_R04_SEED_PARAMETERIZATION_IDEMPOTENT=${JSON.stringify(result)}`);
    return result;
  }

  applyPgcR04SeedParameterizationPatch();
  const after = inspectSemanticState();
  if (!after.ok) {
    throw new Error(`PGC_R04_SEED_PARAMETERIZATION_INCOMPLETE:${after.missing.join("|")}`);
  }

  const result = Object.freeze({
    status: "PASS_PGC_R04_SEED_PARAMETERIZATION_APPLIED_AND_VERIFIED",
    semanticFileCount: Object.keys(semanticRequirements).length,
    missing: Object.freeze([]),
  });
  console.log(`PGC_R04_SEED_PARAMETERIZATION_IDEMPOTENT=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) runPgcR04SeedParameterizationIdempotent();

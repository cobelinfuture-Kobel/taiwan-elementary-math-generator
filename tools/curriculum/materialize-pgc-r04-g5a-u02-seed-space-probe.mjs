import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import { generateG5AU02Canonical, validateG5AU02Canonical } from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import { enrichG5AU02GeneratedItemPrompt } from "../../src/curriculum/g5a-u02/question-display-model.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsonPath = path.join(root, "data/curriculum/public-generation/r04_g5a_u02_seed_space_probe.json");
const reportPath = path.join(root, "docs/curriculum/output/PGC-R04-A04_G5A_U02_seed_space_probe.md");
const scanSeedCount = 4096;
const targetGroupIds = Object.freeze([
  "pg_g5a_u02_factor_relation_equivalence",
  "pg_g5a_u02_factor_enumeration_division",
  "pg_g5a_u02_factor_enumeration_pairs",
  "pg_g5a_u02_factor_order_symmetry",
  "pg_g5a_u02_factor_membership_judgement",
  "pg_g5a_u02_problem_type_discrimination",
  "pg_g5a_u02_common_factor_concept",
  "pg_g5a_u02_common_factor_enumeration",
  "pg_g5a_u02_greatest_common_factor",
]);
const hash = (value, length = 24) => crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);

function promptFor(item) {
  const enriched = enrichG5AU02GeneratedItemPrompt(item);
  return String(enriched?.prompt ?? item?.prompt ?? "").replace(/\s+/g, " ").trim();
}

function probeSpec(spec) {
  const promptToSeeds = new Map();
  const failures = [];
  for (let seed = 1; seed <= scanSeedCount; seed += 1) {
    try {
      const item = generateG5AU02Canonical(spec.patternSpecId, { seed });
      const validation = validateG5AU02Canonical(item);
      if (!validation.ok) {
        failures.push({ seed, codes: validation.errors });
        continue;
      }
      const prompt = promptFor(item);
      if (!prompt) {
        failures.push({ seed, codes: ["VISIBLE_PROMPT_MISSING"] });
        continue;
      }
      const signature = hash(prompt);
      const seeds = promptToSeeds.get(signature) ?? [];
      if (seeds.length < 8) seeds.push(seed);
      promptToSeeds.set(signature, seeds);
    } catch (error) {
      failures.push({ seed, codes: [String(error?.message ?? error)] });
    }
  }
  const uniquePromptCount = promptToSeeds.size;
  const samplePromptSignatures = [...promptToSeeds.entries()].slice(0, 25).map(([signature, seeds]) => ({ signature, seeds }));
  return {
    patternSpecId: spec.patternSpecId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    implementationClass: spec.implementationClass,
    scannedSeedCount: scanSeedCount,
    successfulSeedCount: scanSeedCount - failures.length,
    failureCount: failures.length,
    uniquePromptCount,
    supports20UniquePrompts: uniquePromptCount >= 20,
    supports40UniquePrompts: uniquePromptCount >= 40,
    averageSeedsPerPrompt: uniquePromptCount > 0 ? Number(((scanSeedCount - failures.length) / uniquePromptCount).toFixed(3)) : null,
    samplePromptSignatures,
    failures: failures.slice(0, 25),
  };
}

function writeReport(contract) {
  const s = contract.summary;
  const lines = [
    "# PGC-R04-A04 G5A-U02 Canonical Seed-space Capacity Probe",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "```text",
    `TARGET_PATTERN_SPECS           = ${s.targetPatternSpecCount}`,
    `SCANNED_SEEDS_PER_SPEC         = ${s.scannedSeedsPerSpec}`,
    `TOTAL_GENERATION_FAILURES      = ${s.totalFailureCount}`,
    `SPECS_WITH_20_UNIQUE_PROMPTS   = ${s.specsWith20UniquePrompts}`,
    `SPECS_BELOW_20_UNIQUE_PROMPTS  = ${s.specsBelow20UniquePrompts}`,
    `MINIMUM_UNIQUE_PROMPT_COUNT    = ${s.minimumUniquePromptCount}`,
    `MAXIMUM_UNIQUE_PROMPT_COUNT    = ${s.maximumUniquePromptCount}`,
    "```",
    "",
    "| PatternSpec | Group | Unique prompts | 20-capable | Failures |",
    "|---|---|---:|---|---:|",
    ...contract.patternSpecs.map((row) => `| \`${row.patternSpecId}\` | \`${row.patternGroupId}\` | ${row.uniquePromptCount} | ${row.supports20UniquePrompts} | ${row.failureCount} |`),
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_NUMERIC_CAPACITY_QUEUE_REPRIORITIZED",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_G5A_U02_CAPACITY_ROOT_CLASSIFIED" : "D1_G5A_U02_CAPACITY_PROBE_BLOCKED"}`,
    `DISTANCE_REDUCED     = ${contract.repairStrategy.rationale}`,
    "REMAINING_BLOCKERS   = [G5A_U02_11_CAPACITY_ROUTES, 58_OTHER_NUMERIC_CAPACITY_ROUTES, 24_DIVERSITY_ROUTES]",
    `NEXT_SHORTEST_STEP   = ${contract.repairStrategy.nextTaskId}`,
    "```",
    "",
  ];
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
}

export function materializePgcR04G5aU02SeedSpaceProbe() {
  const specs = getG5AU02HiddenPatternSpecs().filter((spec) => targetGroupIds.includes(spec.patternGroupId));
  const patternSpecs = specs.map(probeSpec);
  const below20 = patternSpecs.filter((row) => !row.supports20UniquePrompts);
  const failures = patternSpecs.reduce((sum, row) => sum + row.failureCount, 0);
  const blocking = [];
  if (specs.length !== 11) blocking.push({ code: "TARGET_PATTERN_SPEC_COUNT_DRIFT", expected: 11, actual: specs.length });
  if (failures > 0) blocking.push({ code: "CANONICAL_SEED_SPACE_GENERATION_FAILURE", count: failures });
  const repairStrategy = below20.length === 0
    ? {
      classification: "SEED_ALLOCATION_AND_DEDUP_COLLISION",
      affectedPatternSpecIds: [],
      rationale: "All 11 canonical PatternSpecs already contain at least 20 unique visible prompts; the capacity blocker is the worksheet's consecutive-seed allocation without deterministic duplicate avoidance.",
      nextTaskId: "PGC-R04-A04B_G5A_U02_SharedSeedAllocationAndPromptDedupFullFix",
    }
    : {
      classification: "GENERATOR_POOL_EXPANSION_REQUIRED",
      affectedPatternSpecIds: below20.map((row) => row.patternSpecId),
      rationale: `${below20.length} canonical PatternSpecs expose fewer than 20 unique visible prompts across 4096 seeds and require targeted parameter-domain expansion before shared dedup can certify 20 questions.`,
      nextTaskId: "PGC-R04-A04B_G5A_U02_TargetedGeneratorPoolExpansionFullFix",
    };
  const uniqueCounts = patternSpecs.map((row) => row.uniquePromptCount);
  const summary = {
    targetPatternSpecCount: patternSpecs.length,
    scannedSeedsPerSpec: scanSeedCount,
    totalFailureCount: failures,
    specsWith20UniquePrompts: patternSpecs.filter((row) => row.supports20UniquePrompts).length,
    specsBelow20UniquePrompts: below20.length,
    minimumUniquePromptCount: Math.min(...uniqueCounts),
    maximumUniquePromptCount: Math.max(...uniqueCounts),
    blockingProbeGapCount: blocking.length,
  };
  const contract = {
    schemaName: "PgcR04G5aU02SeedSpaceProbeV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix",
    milestoneId: "PGC-R04-A04A_G5A_U02_CanonicalSeedSpaceProbe",
    status: blocking.length === 0 ? "PASS" : "FAIL_CLOSED",
    sourceId: "g5a_u02_5a02",
    targetPatternGroupIds: [...targetGroupIds],
    summary,
    blockingGaps: blocking,
    repairStrategy,
    patternSpecs,
  };
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeReport(contract);
  console.log(`PGC_R04_G5A_U02_SEED_SPACE_SUMMARY=${JSON.stringify(summary)}`);
  console.log(`PGC_R04_G5A_U02_REPAIR_STRATEGY=${JSON.stringify(repairStrategy)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) materializePgcR04G5aU02SeedSpaceProbe();

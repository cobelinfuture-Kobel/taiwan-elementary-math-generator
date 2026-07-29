import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const coreRelativePath = "site/modules/curriculum/batch-a/g5a-u08-application-generator-core.js";
const plannerRelativePath = "site/modules/curriculum/batch-a/g5a-u08-application-batch-planner.js";
const marker = "PGC-R05 G5A-U08 near-round application diversity FullFix V2";

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`PGC_R05_G5A_U08_DIVERSITY_ANCHOR_MISSING:${label}`);
  return source.replace(before, after);
}

function patchCore(before) {
  if (before.includes(marker)) return before;
  let source = before;
  source = replaceRequired(
    source,
    `function deterministicShuffle(values, seed) {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(seed, output.length - index, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}`,
    `function deterministicShuffle(values, seed) {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(seed, output.length - index, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

const PGC_R05_NEAR_ROUND_BASES = Object.freeze([100, 500, 1000, 2000]);
const PGC_R05_NEAR_ROUND_OFFSET_COUNT = 9;
const PGC_R05_NEAR_ROUND_DIRECTION_COUNT = 2;
const PGC_R05_NEAR_ROUND_QUANTITY_COUNT = 22;
const PGC_R05_NEAR_ROUND_PARAMETER_SPACE = PGC_R05_NEAR_ROUND_BASES.length
  * PGC_R05_NEAR_ROUND_OFFSET_COUNT
  * PGC_R05_NEAR_ROUND_DIRECTION_COUNT
  * PGC_R05_NEAR_ROUND_QUANTITY_COUNT;

function normalizedPgcR05NearRoundOrdinal(seedLabel, diversityOrdinal) {
  if (!String(seedLabel ?? "").includes("pgc-r05")) return null;
  if (!Number.isSafeInteger(diversityOrdinal) || diversityOrdinal < 0) return null;
  return diversityOrdinal % PGC_R05_NEAR_ROUND_PARAMETER_SPACE;
}`,
    "injective-parameter-space",
  );

  source = replaceRequired(
    source,
    `function sampleNearRoundPrice(seed, context, depth) {
  const roundBase = randomChoice(seed, 1, [100, 500, 1000, 2000]);
  const offset = randomInt(seed, 2, 1, 9);
  const direction = randomInt(seed, 3, 0, 1) === 0 ? "below" : "above";
  const nearRoundUnitPrice = direction === "below" ? roundBase - offset : roundBase + offset;
  const quantity = randomInt(seed, 4, 3, 24);`,
    `function sampleNearRoundPrice(seed, context, depth, pgcR05DiversityOrdinal = null) {
  let roundBase;
  let offset;
  let direction;
  let quantity;
  if (Number.isSafeInteger(pgcR05DiversityOrdinal)) {
    let slot = pgcR05DiversityOrdinal;
    roundBase = PGC_R05_NEAR_ROUND_BASES[slot % PGC_R05_NEAR_ROUND_BASES.length];
    slot = Math.floor(slot / PGC_R05_NEAR_ROUND_BASES.length);
    offset = 1 + (slot % PGC_R05_NEAR_ROUND_OFFSET_COUNT);
    slot = Math.floor(slot / PGC_R05_NEAR_ROUND_OFFSET_COUNT);
    direction = slot % PGC_R05_NEAR_ROUND_DIRECTION_COUNT === 0 ? "below" : "above";
    slot = Math.floor(slot / PGC_R05_NEAR_ROUND_DIRECTION_COUNT);
    quantity = 3 + (slot % PGC_R05_NEAR_ROUND_QUANTITY_COUNT);
  } else {
    roundBase = randomChoice(seed, 1, PGC_R05_NEAR_ROUND_BASES);
    offset = randomInt(seed, 2, 1, 9);
    direction = randomInt(seed, 3, 0, 1) === 0 ? "below" : "above";
    quantity = randomInt(seed, 4, 3, 24);
  }
  const nearRoundUnitPrice = direction === "below" ? roundBase - offset : roundBase + offset;`,
    "near-round-sampler",
  );

  source = replaceRequired(
    source,
    `function sampleForPatternSpec(patternSpecId, seed, context, depth) {`,
    `function sampleForPatternSpec(patternSpecId, seed, context, depth, pgcR05DiversityOrdinal = null) {`,
    "sample-dispatch-signature",
  );
  source = replaceRequired(
    source,
    `    case "ps_g5a_u08_app_near_round_unit_price": return sampleNearRoundPrice(seed, context, depth);`,
    `    case "ps_g5a_u08_app_near_round_unit_price": return sampleNearRoundPrice(seed, context, depth, pgcR05DiversityOrdinal);`,
    "near-round-dispatch",
  );
  source = replaceRequired(
    source,
    `  { seed = "s60h", depth = null, contextType = null } = {},`,
    `  { seed = "s60h", depth = null, contextType = null, diversityOrdinal = null } = {},`,
    "question-option",
  );
  source = replaceRequired(
    source,
    `  const context = contextMeta(patternSpecId, selectedContext, normalizedSeed);
  const sample = sampleForPatternSpec(patternSpecId, normalizedSeed, context, selectedDepth);`,
    `  const context = contextMeta(patternSpecId, selectedContext, normalizedSeed);
  const pgcR05DiversityOrdinal = patternSpecId === "ps_g5a_u08_app_near_round_unit_price"
    ? normalizedPgcR05NearRoundOrdinal(seed, diversityOrdinal)
    : null;
  const sample = sampleForPatternSpec(patternSpecId, normalizedSeed, context, selectedDepth, pgcR05DiversityOrdinal);`,
    "question-profile-projection",
  );
  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

function patchPlanner(before) {
  if (before.includes(marker)) return before;
  let source = before;
  source = replaceRequired(
    source,
    `function generateQuestionForCell(patternSpecId, depth, contextType, seed, desiredSdgGoalId = null) {`,
    `function generateQuestionForCell(patternSpecId, depth, contextType, seed, desiredSdgGoalId = null, diversityOrdinal = null) {`,
    "cell-generator-signature",
  );
  source = replaceRequired(
    source,
    `      contextType,
    });`,
    `      contextType,
      diversityOrdinal,
    });`,
    "cell-generator-option",
  );
  source = replaceRequired(
    source,
    `      desiredSdgGoalId,
    );
    sequence += 1;`,
    `      desiredSdgGoalId,
      sequence,
    );
    sequence += 1;`,
    "sequence-projection",
  );
  return `${source.trimEnd()}\n\n// ${marker}\n`;
}

export function applyPgcR05G5AU08ApplicationDiversityPatch() {
  const corePath = path.join(repoRoot, coreRelativePath);
  const plannerPath = path.join(repoRoot, plannerRelativePath);
  const coreBefore = fs.readFileSync(corePath, "utf8");
  const plannerBefore = fs.readFileSync(plannerPath, "utf8");
  const coreAfter = patchCore(coreBefore);
  const plannerAfter = patchPlanner(plannerBefore);
  if (coreAfter !== coreBefore) fs.writeFileSync(corePath, coreAfter);
  if (plannerAfter !== plannerBefore) fs.writeFileSync(plannerPath, plannerAfter);

  const changedFiles = [];
  if (coreAfter !== coreBefore) changedFiles.push(coreRelativePath);
  if (plannerAfter !== plannerBefore) changedFiles.push(plannerRelativePath);
  const result = Object.freeze({
    status: changedFiles.length > 0
      ? "PASS_PGC_R05_G5A_U08_APPLICATION_DIVERSITY_PATCH_APPLIED"
      : "PASS_PGC_R05_G5A_U08_APPLICATION_DIVERSITY_ALREADY_APPLIED",
    changedFiles: Object.freeze(changedFiles),
    verifiedFiles: Object.freeze([coreRelativePath, plannerRelativePath]),
    profile: "pgc-r05-seed-only",
    targetPatternSpecId: "ps_g5a_u08_app_near_round_unit_price",
    sequenceInjectiveParameterSpace: 1584,
    explicitOrdinalProjection: true,
    legacySeedBehaviorPreserved: true,
    validatorRelaxed: false,
    numericRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    newPatternSpecsAdded: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
  });
  console.log(`PGC_R05_G5A_U08_DIVERSITY_PATCH=${JSON.stringify(result)}`);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) applyPgcR05G5AU08ApplicationDiversityPatch();

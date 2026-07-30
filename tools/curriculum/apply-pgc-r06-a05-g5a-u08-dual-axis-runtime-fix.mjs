import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TASK_ID = "PGC-R06-A05_G5A-U08_30ResidualDualAxisFullFix";
const PBL_FILE = "site/modules/curriculum/public/fifteen-unit-public-pbl-runtime.js";
const ROUTER_FILE = "site/modules/curriculum/batch-a/g5a-u08-canonical-router.js";
const PBL_MARKER = "PGC-R06 A05 G5A-U08 seed-aware PBL producer";
const ROUTER_MARKER = "PGC-R06 A05 G5A-U08 deterministic unique rejection sampling";

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function replaceFunction(source, signature, replacement) {
  const start = source.indexOf(signature);
  if (start < 0) throw new Error(`PGC_R06_A05_FUNCTION_ANCHOR_MISSING:${signature}`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`PGC_R06_A05_FUNCTION_BRACE_MISSING:${signature}`);
  let depth = 0;
  let end = -1;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error(`PGC_R06_A05_FUNCTION_END_MISSING:${signature}`);
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function patchFile(relativePath, marker, mutate) {
  const filePath = absolute(relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  if (before.includes(marker)) return false;
  const after = mutate(before);
  if (after === before || !after.includes(marker)) {
    throw new Error(`PGC_R06_A05_PATCH_NOT_APPLIED:${relativePath}`);
  }
  fs.writeFileSync(filePath, after);
  return true;
}

const pblChanged = patchFile(PBL_FILE, PBL_MARKER, (source) => replaceFunction(
  source,
  "function buildG5AU08(plan, index)",
  `function buildG5AU08(plan, index) {
  const seedText = String(plan.generationSeed ?? "").trim();
  const controlText = \`${"${plan.depthMode ?? \"mixed\"}:${plan.contextMode ?? \"mixed\"}"}\`;
  const seedBase = seedText ? stableSeedHash(\`${"${seedText}:${controlText}"}\`) % 997 : 0;
  const days = 5 + ((seedBase + index) % 3);
  const daily = 120 + ((seedBase * 13 + index * 37) % 700);
  const bonus = 300 + ((seedBase * 19 + index * 53) % 800);
  const earned = days * daily + bonus;
  const redeemableRange = Math.max(1, Math.min(900, earned - days - 100));
  const redeemed = 100 + ((seedBase * 7 + index * 29) % redeemableRange);
  const remaining = earned - redeemed;
  const average = Math.floor(remaining / days);
  return makeItem(plan, index, {
    patternSpecId: "pbl_g5a_u08_recycling_points_plan",
    knowledgePointId: "kp_g5a_u08_mixed_operation_order",
    operationFamilyId: "PBL5_MIXED_OPERATION_RESOURCE_PLAN",
    projectionType: "PBL5_BOUNDED_DECISION",
    taskCount: 5,
    dependencyGraph: ["Q1->Q2", "Q2->Q3", "Q3->Q4", "Q4->Q5"],
    finalProduct: "回收點數使用計畫",
    givenRoleValues: { days, daily, bonus, redeemed },
    prompt: \`PBL任務｜資源回收點數計畫。連續${"${days}"}天每天獲得${"${daily}"}點，完成專題再加${"${bonus}"}點，已兌換${"${redeemed}"}點。①每日點數合計？②加上專題後共有多少點？③兌換後剩多少點？④把剩餘點數平均規劃到${"${days}"}天，每天最多可用多少整數點？⑤提出不超支的使用決策。\`,
    answerText: \`①${"${days * daily}"}點；②${"${earned}"}點；③${"${remaining}"}點；④每天最多${"${average}"}點；⑤依此上限使用不超支。\`,
  });
}

// ${PBL_MARKER}`,
));

const routerChanged = patchFile(ROUTER_FILE, ROUTER_MARKER, (source) => {
  const helperBlock = `const PGC_R06_A05_MAX_UNIQUE_ATTEMPTS = 64;

function pgcR06A05PromptKey(question = {}) {
  return String(question.promptText ?? question.prompt ?? question.blankedDisplayText ?? "").trim();
}

function pgcR06A05GenerateValidatedBatch(normalized, entry, questionCount, seed, numericValidator, applicationValidator) {
  let batch;
  let validation;
  if (entry.runtimeKind === "numeric_or_noncontext_reasoning") {
    batch = generateG5AU08HiddenBatch({
      questionCount,
      seed,
      selectedPatternSpecIds: entry.selectedPatternSpecIds,
      ordering: "grouped",
    });
    validation = numericValidator(batch);
  } else {
    batch = generateG5AU08ApplicationBatch({
      questionCount,
      seed,
      selectedPatternSpecIds: entry.selectedPatternSpecIds,
      depthMode: normalized.depthMode,
      contextMode: normalized.contextMode,
      ordering: "grouped",
    });
    validation = applicationValidator(batch);
  }
  return { batch, validation };
}

function pgcR06A05CollectUniqueQuestions(normalized, entry, seenPromptKeys, numericValidator, applicationValidator) {
  const accepted = [];
  const warnings = [];
  const errors = [];
  for (let attempt = 0; accepted.length < entry.questionCount && attempt < PGC_R06_A05_MAX_UNIQUE_ATTEMPTS; attempt += 1) {
    const remaining = entry.questionCount - accepted.length;
    const seed = \`${"${normalized.generationSeed}:${entry.patternGroupId}:${entry.questionCount}:pgc-r06-a05:${attempt}"}\`;
    const { validation } = pgcR06A05GenerateValidatedBatch(
      normalized,
      entry,
      remaining,
      seed,
      numericValidator,
      applicationValidator,
    );
    warnings.push(...(validation?.warnings ?? []));
    if (validation?.valid !== true) {
      errors.push(...(validation?.errors ?? [issue("G5A_U08_CANONICAL_VALIDATION_FAILED", "validation", "Blocking validator rejected the generated batch.")]));
      break;
    }
    for (const question of validation.acceptedQuestions ?? []) {
      const key = pgcR06A05PromptKey(question);
      if (!key || seenPromptKeys.has(key)) continue;
      seenPromptKeys.add(key);
      accepted.push(question);
      if (accepted.length === entry.questionCount) break;
    }
  }
  if (accepted.length !== entry.questionCount && errors.length === 0) {
    errors.push(issue("G5A_U08_CANONICAL_UNIQUE_CAPACITY_EXHAUSTED", "questions", "Canonical runtime 無法在限制內產生足量的不重複題目。", {
      patternGroupId: entry.patternGroupId,
      expected: entry.questionCount,
      actual: accepted.length,
    }));
  }
  return { accepted, warnings, errors };
}

// ${ROUTER_MARKER}

`;

  const replacement = `export function generateG5AU08CanonicalQuestions(plan = {}, options = {}) {
  const checked = validateG5AU08CanonicalPlan(plan);
  const normalized = checked.plan;
  if (!checked.ok) return { ok: false, plan: normalized, questions: [], allocation: cloneValue(normalized.allocation ?? []), errors: checked.errors, warnings: checked.warnings };

  const numericValidator = options.numericValidator ?? validateG5AU08HiddenBatch;
  const applicationValidator = options.applicationValidator ?? validateG5AU08ApplicationBatch;
  const generatedRows = [];
  const seenPromptKeys = new Set();
  const errors = [];
  const warnings = [];
  let sequenceNumber = 0;

  for (const entry of normalized.allocation) {
    const collected = pgcR06A05CollectUniqueQuestions(
      normalized,
      entry,
      seenPromptKeys,
      numericValidator,
      applicationValidator,
    );
    warnings.push(...collected.warnings);
    errors.push(...collected.errors);
    for (const question of collected.accepted) {
      sequenceNumber += 1;
      const promoted = promoteQuestion(question, normalized, entry, sequenceNumber);
      const lifecycle = validateG5AU08CanonicalQuestion(promoted);
      if (!lifecycle.ok) errors.push(...lifecycle.errors);
      generatedRows.push(promoted);
    }
  }

  if (generatedRows.length !== normalized.questionCount) {
    errors.push(issue("G5A_U08_CANONICAL_OUTPUT_COUNT_MISMATCH", "questions", "Canonical output 題數不一致。", { expected: normalized.questionCount, actual: generatedRows.length }));
  }
  if (errors.length > 0) {
    return { ok: false, plan: normalized, questions: [], allocation: cloneValue(normalized.allocation), errors, warnings };
  }
  const questions = normalized.ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(generatedRows, \`${"${normalized.generationSeed}:s60i:${normalized.questionCount}"}\`)
    : generatedRows;
  return {
    ok: true,
    plan: { ...normalized, routeKind: G5A_U08_CANONICAL_ROUTE_KINDS.CANONICAL },
    questions,
    allocation: cloneValue(normalized.allocation),
    errors: [],
    warnings,
  };
}`;

  const withHelpers = source.replace(
    "export function generateG5AU08CanonicalQuestions(plan = {}, options = {})",
    `${helperBlock}export function generateG5AU08CanonicalQuestions(plan = {}, options = {})`,
  );
  return replaceFunction(withHelpers, "export function generateG5AU08CanonicalQuestions(plan = {}, options = {})", replacement);
});

console.log(`PGC_R06_A05_RUNTIME_PATCH=${JSON.stringify({
  taskId: TASK_ID,
  status: "PASS",
  pblChanged,
  routerChanged,
  pblMarker: PBL_MARKER,
  routerMarker: ROUTER_MARKER,
})}`);

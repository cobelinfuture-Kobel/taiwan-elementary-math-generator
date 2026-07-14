import { buildAndRenderG5AU02HiddenWorksheet } from "./hidden-renderer.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const G5A_U02_PRODUCTION_STRESS_MATRIX = deepFreeze({
  questionCounts: [1, 22, 44, 100, 200],
  seeds: [95, 195, 295, 395, 495, 595, 695, 795, 895, 995],
  answerKeyModes: [true, false],
  expectedPatternSpecCount: 22,
  expectedAnswerModelShapeCount: 16,
  maxQuestionCount: 200,
});

export const G5A_U02_PRODUCTION_LIFECYCLE = deepFreeze({
  unitId: "g5a_u02",
  generatorStatus: "canonical_generator_stress_verified",
  validatorStatus: "blocking_validation_stress_verified",
  worksheetStatus: "exact_count_stress_verified",
  rendererStatus: "a4_html_stress_verified",
  browserPipelineStatus: "public_static_canonical_connected",
  htmlPdfStressStatus: "production_stress_required",
  selectorStatus: "public_source_unit",
  publicSelectionMode: "sourceUnit",
  productionUse: "allowed_canonical_static_release",
  arbitraryBrowserRegeneration: false,
  genericFallback: false,
  freeFormAI: false,
});

function countOccurrences(text, token) {
  return String(text).split(token).length - 1;
}

function validateScenario(result, scenario) {
  const errors = [];
  if (!result?.ok) return [...(result?.errors ?? ["G5AU02_PRODUCTION_STRESS_RESULT_FAILED"])];
  const { worksheetDocument, renderedWorksheet } = result;
  if (worksheetDocument.questionCount !== scenario.questionCount) errors.push("G5AU02_PRODUCTION_STRESS_QUESTION_COUNT_MISMATCH");
  if (worksheetDocument.questionRecords.length !== scenario.questionCount) errors.push("G5AU02_PRODUCTION_STRESS_QUESTION_RECORD_COUNT_MISMATCH");
  const expectedAnswers = scenario.includeAnswerKey ? scenario.questionCount : 0;
  if (worksheetDocument.answerKeyRecords.length !== expectedAnswers) errors.push("G5AU02_PRODUCTION_STRESS_ANSWER_COUNT_MISMATCH");
  if (renderedWorksheet.questionCount !== scenario.questionCount) errors.push("G5AU02_PRODUCTION_STRESS_RENDERER_COUNT_MISMATCH");
  if (countOccurrences(renderedWorksheet.html, "g5a-u02-card--question") !== scenario.questionCount) errors.push("G5AU02_PRODUCTION_STRESS_HTML_QUESTION_COUNT_MISMATCH");
  if (countOccurrences(renderedWorksheet.html, "g5a-u02-card--answer") !== expectedAnswers) errors.push("G5AU02_PRODUCTION_STRESS_HTML_ANSWER_COUNT_MISMATCH");
  if (!scenario.includeAnswerKey && renderedWorksheet.html.includes("g5a-u02-section--answer-key")) errors.push("G5AU02_PRODUCTION_STRESS_ANSWER_SUPPRESSION_FAILED");
  if (worksheetDocument.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_PRODUCTION_STRESS_SOURCE_LIFECYCLE_MUTATED");
  if (renderedWorksheet.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_PRODUCTION_STRESS_RENDERER_LIFECYCLE_MUTATED");
  if (!renderedWorksheet.html.startsWith("<!doctype html>")) errors.push("G5AU02_PRODUCTION_STRESS_DOCTYPE_MISSING");
  if (!renderedWorksheet.html.includes("@page{size:A4")) errors.push("G5AU02_PRODUCTION_STRESS_A4_STYLE_MISSING");
  return errors;
}

export function buildG5AU02ProductionStressScenarios(matrix = G5A_U02_PRODUCTION_STRESS_MATRIX) {
  const scenarios = [];
  for (const questionCount of matrix.questionCounts) {
    for (const baseSeed of matrix.seeds) {
      for (const includeAnswerKey of matrix.answerKeyModes) {
        scenarios.push(deepFreeze({ questionCount, baseSeed, includeAnswerKey }));
      }
    }
  }
  return deepFreeze(scenarios);
}

export function runG5AU02ProductionStressAudit(matrix = G5A_U02_PRODUCTION_STRESS_MATRIX) {
  const scenarios = buildG5AU02ProductionStressScenarios(matrix);
  const errors = [];
  const htmlVariantsByCount = new Map();
  let totalQuestions = 0;
  let totalAnswers = 0;
  let maxHtmlBytes = 0;
  let deterministicReplayCount = 0;

  for (const scenario of scenarios) {
    const options = {
      questionCount: scenario.questionCount,
      baseSeed: scenario.baseSeed,
      includeAnswerKey: scenario.includeAnswerKey,
      questionRowsPerPage: Math.min(22, scenario.questionCount),
      answerRowsPerPage: Math.min(22, scenario.questionCount),
    };
    const result = buildAndRenderG5AU02HiddenWorksheet(options, {
      title: "五上因數與公因數｜S95 Production Stress",
      subtitle: `題數 ${scenario.questionCount}｜種子 ${scenario.baseSeed}`,
    });
    errors.push(...validateScenario(result, scenario).map((code) => `${code}:${scenario.questionCount}:${scenario.baseSeed}:${scenario.includeAnswerKey}`));
    if (!result?.ok) continue;

    totalQuestions += result.worksheetDocument.questionCount;
    totalAnswers += result.worksheetDocument.answerKeyRecords.length;
    maxHtmlBytes = Math.max(maxHtmlBytes, Buffer.byteLength(result.renderedWorksheet.html, "utf8"));
    const key = `${scenario.questionCount}:${scenario.includeAnswerKey}`;
    const variants = htmlVariantsByCount.get(key) ?? new Set();
    variants.add(result.renderedWorksheet.html);
    htmlVariantsByCount.set(key, variants);

    const replay = buildAndRenderG5AU02HiddenWorksheet(options, {
      title: "五上因數與公因數｜S95 Production Stress",
      subtitle: `題數 ${scenario.questionCount}｜種子 ${scenario.baseSeed}`,
    });
    if (!replay.ok || replay.renderedWorksheet.html !== result.renderedWorksheet.html) {
      errors.push(`G5AU02_PRODUCTION_STRESS_NONDETERMINISTIC:${scenario.questionCount}:${scenario.baseSeed}:${scenario.includeAnswerKey}`);
    } else {
      deterministicReplayCount += 1;
    }
  }

  for (const [key, variants] of htmlVariantsByCount) {
    if (matrix.seeds.length > 1 && variants.size < 2) errors.push(`G5AU02_PRODUCTION_STRESS_SEED_VARIATION_MISSING:${key}`);
  }

  const expectedScenarioCount = matrix.questionCounts.length * matrix.seeds.length * matrix.answerKeyModes.length;
  if (scenarios.length !== expectedScenarioCount) errors.push("G5AU02_PRODUCTION_STRESS_SCENARIO_COUNT_MISMATCH");
  if (deterministicReplayCount !== scenarios.length) errors.push("G5AU02_PRODUCTION_STRESS_REPLAY_COVERAGE_MISMATCH");

  return deepFreeze({
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    task: "S95_G5A_U02_ProductionStressHTMLPDFAndD0Closeout",
    scenarioCount: scenarios.length,
    deterministicReplayCount,
    totalQuestions,
    totalAnswers,
    maxHtmlBytes,
    questionCounts: [...matrix.questionCounts],
    seedCount: matrix.seeds.length,
    answerKeyModeCount: matrix.answerKeyModes.length,
    patternSpecCount: matrix.expectedPatternSpecCount,
    answerModelShapeCount: matrix.expectedAnswerModelShapeCount,
    lifecycle: G5A_U02_PRODUCTION_LIFECYCLE,
  });
}

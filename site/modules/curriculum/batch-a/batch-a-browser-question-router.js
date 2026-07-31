export * from "./batch-a-browser-question-router-pre-p01d1.js";

import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f13.js";
import { generateBatchABrowserQuestions as generatePreP01D1Questions } from "./batch-a-browser-question-router-pre-p01d1.js";
import { canGenerateG5BU05LargeNumberQuestions, generateG5BU05LargeNumberQuestions } from "./large-number-place-value-runtime.js";
import { canGenerateG6AU01NumberTheoryQuestions, generateG6AU01NumberTheoryQuestions } from "./number-theory-runtime.js";
import { canGenerateG5AU03FactorMultipleQuestions, generateG5AU03FactorMultipleQuestions } from "./factor-multiple-runtime.js";
import { canGenerateG3AU08PartWholeFractionQuestions, generateG3AU08PartWholeFractionQuestions } from "./part-whole-fraction-runtime.js";
import { canGenerateG3AU08Slice002Questions, generateG3AU08Slice002Questions } from "./slice002-fraction-runtime.js";
import { canGenerateG3BU07QuotientFractionQuestions, generateG3BU07QuotientFractionQuestions } from "./quotient-fraction-runtime.js";
import { canGenerateG3BU09TenthDecimalQuestions, generateG3BU09TenthDecimalQuestions } from "./tenth-decimal-runtime.js";
import { canGenerateG4BU08EquivalentFractionQuestions, generateG4BU08EquivalentFractionQuestions } from "./equivalent-fraction-runtime.js";
import { canGenerateG4BU08EquivalenceCrossProductQuestions, generateG4BU08EquivalenceCrossProductQuestions } from "./equivalence-cross-product-runtime.js";
import { canGenerateG5AU04SimplestFractionQuestions, generateG5AU04SimplestFractionQuestions } from "./simplest-fraction-runtime.js";
import { canGenerateG5AU04QuotientFractionQuestions, generateG5AU04QuotientFractionQuestions } from "./quotient-as-fraction-context-runtime.js";
import { canGenerateG3AU08SameDenominatorCompareQuestions, generateG3AU08SameDenominatorCompareQuestions } from "./same-denominator-fraction-compare-runtime.js";
import { canGenerateG3BU07FractionUnitConversionQuestions, generateG3BU07FractionUnitConversionQuestions } from "./discrete-fraction-conversion-runtime.js";
import { canGenerateP03F8DecimalSliceQuestions, generateP03F8DecimalSliceQuestions } from "./decimal-slice008-runtime.js";
import { canGenerateG3BU09TenthsFractionDecimalQuestions, generateG3BU09TenthsFractionDecimalQuestions } from "./tenths-fraction-decimal-runtime.js";
import { canGenerateG4AU09HundredthDecimalQuestions, generateG4AU09HundredthDecimalQuestions } from "./hundredth-decimal-runtime.js";
import { canGenerateG4BU06DecimalMultiplicationQuestions, generateG4BU06DecimalMultiplicationQuestions } from "./one-decimal-times-integer-runtime.js";
import { applyPgcR04NumericUniqueAllocation } from "./numeric-unique-allocation-fullfix.js";
import { applyRegenerateIdentitySeedOrder } from "./regenerate-identity-seed-order.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-extension.js";
import { listW01PublicApplicationGroupsForKnowledgePoint } from "../registry/w01-public-application-groups.js";

function unique(values = []) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function groupLooksApplication(group = {}) {
  const corpus = JSON.stringify({
    mode: group.mode,
    publicQuestionMode: group.publicQuestionMode,
    representationTag: group.representationTag,
    representationTags: group.representationTags,
    displayName: group.displayName,
    globalContextAdmission: group.globalContextAdmission,
  }).toLowerCase();
  return corpus.includes("application")
    || corpus.includes("word_problem")
    || corpus.includes("controlled_semantic")
    || corpus.includes("應用題");
}

function applicationGroupsForKnowledgePoint(knowledgePointId) {
  const groups = [
    ...getVisiblePatternGroupsForKnowledgePoint(knowledgePointId),
    ...listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId),
  ].filter(groupLooksApplication);
  return [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
}

export function normalizePublicApplicationPatternGroupAliases(options = {}) {
  if (options.questionMode !== "application") return options;
  const requestedKnowledgePointIds = unique(
    options.selectedKnowledgePointIds ?? options.knowledgePointIds ?? [],
  );
  const requestedPatternGroupIds = unique(options.selectedPatternGroupIds ?? []);
  if (requestedKnowledgePointIds.length === 0 || requestedPatternGroupIds.length === 0) return options;

  const candidates = requestedKnowledgePointIds.flatMap(applicationGroupsForKnowledgePoint);
  if (candidates.length === 0) return options;

  const singleCandidateFallback = requestedKnowledgePointIds.length === 1
    && requestedPatternGroupIds.length === 1
    && candidates.length === 1
      ? candidates[0]
      : null;
  const normalizedPatternGroupIds = requestedPatternGroupIds.map((patternGroupId) => {
    const exact = candidates.find((group) => group.patternGroupId === patternGroupId);
    if (exact) return exact.patternGroupId;
    const alias = candidates.find((group) => group.basePatternGroupId === patternGroupId);
    return alias?.patternGroupId ?? singleCandidateFallback?.patternGroupId ?? patternGroupId;
  });
  if (normalizedPatternGroupIds.every((id, index) => id === requestedPatternGroupIds[index])) {
    return options;
  }
  return {
    ...options,
    selectedPatternGroupIds: normalizedPatternGroupIds,
    publicApplicationAliasProjection: Object.freeze({
      mode: "PRODUCTION_APPLICATION_GROUP_PRIMARY",
      requestedPatternGroupIds: Object.freeze(requestedPatternGroupIds),
      normalizedPatternGroupIds: Object.freeze(normalizedPatternGroupIds),
    }),
  };
}

export function normalizePublicApplicationDiversitySeed(options = {}) {
  const seed = String(options.generationSeed ?? "").trim();
  if (!options.publicApplicationAliasProjection
    || !seed.startsWith("pgc-r08-")
    || seed.includes(":pgc-r05-application-diversity")) {
    return options;
  }
  const effectiveGenerationSeed = `${seed}:pgc-r05-application-diversity`;
  return {
    ...options,
    generationSeed: effectiveGenerationSeed,
    publicApplicationDiversitySeedProjection: Object.freeze({
      mode: "REUSE_PGC_R05_DETERMINISTIC_RETRY",
      originalGenerationSeed: seed,
      effectiveGenerationSeed,
    }),
  };
}

function generateOnce(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (canGenerateG5AU04QuotientFractionQuestions(plan)) return generateG5AU04QuotientFractionQuestions(options);
  if (canGenerateG5AU04SimplestFractionQuestions(plan)) return generateG5AU04SimplestFractionQuestions(options);
  if (canGenerateG4BU08EquivalenceCrossProductQuestions(plan)) return generateG4BU08EquivalenceCrossProductQuestions(options);
  if (canGenerateG4BU06DecimalMultiplicationQuestions(plan)) return generateG4BU06DecimalMultiplicationQuestions(options);
  if (canGenerateG4AU09HundredthDecimalQuestions(plan)) return generateG4AU09HundredthDecimalQuestions(options);
  if (canGenerateG3BU09TenthsFractionDecimalQuestions(plan)) return generateG3BU09TenthsFractionDecimalQuestions(options);
  if (canGenerateP03F8DecimalSliceQuestions(plan)) return generateP03F8DecimalSliceQuestions(options);
  if (canGenerateG3BU07FractionUnitConversionQuestions(plan)) return generateG3BU07FractionUnitConversionQuestions(options);
  if (canGenerateG3AU08SameDenominatorCompareQuestions(plan)) return generateG3AU08SameDenominatorCompareQuestions(options);
  if (canGenerateG4BU08EquivalentFractionQuestions(plan)) return generateG4BU08EquivalentFractionQuestions(options);
  if (canGenerateG3BU09TenthDecimalQuestions(plan)) return generateG3BU09TenthDecimalQuestions(options);
  if (canGenerateG3BU07QuotientFractionQuestions(plan)) return generateG3BU07QuotientFractionQuestions(options);
  if (canGenerateG3AU08Slice002Questions(plan)) return generateG3AU08Slice002Questions(options);
  if (canGenerateG3AU08PartWholeFractionQuestions(plan)) return generateG3AU08PartWholeFractionQuestions(options);
  if (canGenerateG5AU03FactorMultipleQuestions(plan)) return generateG5AU03FactorMultipleQuestions(options);
  if (canGenerateG6AU01NumberTheoryQuestions(plan)) return generateG6AU01NumberTheoryQuestions(options);
  if (canGenerateG5BU05LargeNumberQuestions(plan)) return generateG5BU05LargeNumberQuestions(options);
  return generatePreP01D1Questions(options);
}

export function generateBatchABrowserQuestions(options = {}) {
  const aliasedOptions = normalizePublicApplicationPatternGroupAliases(options);
  const normalizedOptions = normalizePublicApplicationDiversitySeed(aliasedOptions);
  const result = applyPgcR04NumericUniqueAllocation(generateOnce, normalizedOptions);
  return applyRegenerateIdentitySeedOrder(result, normalizedOptions);
}

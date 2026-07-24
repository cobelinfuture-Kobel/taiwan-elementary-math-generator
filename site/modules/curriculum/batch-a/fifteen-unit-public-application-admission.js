import { listSelectedFifteenUnitPublicApplicationGroups } from "../registry/fifteen-unit-public-application-groups.js";
import {
  FIFTEEN_UNIT_GLOBAL_CONTEXT_REGISTRY_ID,
  buildFifteenUnitGlobalContextLineage,
} from "../public/fifteen-unit-global-context-registry.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function issue(code, path, message) {
  return { code, severity: "error", stage: "fifteen_unit_public_application_admission", path, message };
}

function integerAnswer(question) {
  const raw = question?.finalAnswer?.raw?.value
    ?? question?.finalAnswer
    ?? question?.answer?.raw?.value
    ?? question?.answer
    ?? question?.quotient;
  return Number.isInteger(raw) ? raw : null;
}

function binaryOperands(question) {
  return {
    left: question?.left
      ?? question?.dividend
      ?? question?.expression?.left?.value?.raw?.value
      ?? question?.expression?.left?.raw?.value
      ?? null,
    right: question?.right
      ?? question?.divisor
      ?? question?.expression?.right?.value?.raw?.value
      ?? question?.expression?.right?.raw?.value
      ?? null,
  };
}

function applicationProjection(question, binding, promptText, answerText, relationEvidence) {
  return {
    ...clone(question),
    sourceId: binding.sourceId,
    patternSpecId: binding.patternSpecIds[0],
    knowledgePointId: binding.primaryKnowledgePointId,
    mode: "application",
    questionMode: "application",
    representation: "controlled_semantic_application",
    applicationText: true,
    promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} 答案：${answerText}`,
    answerText,
    selectorStatus: "visible",
    visibilityStatus: "visible",
    productionUse: "allowed",
    closeoutApplicationAdmission: {
      programId: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
      sourceId: binding.sourceId,
      knowledgePointId: binding.primaryKnowledgePointId,
      publicPatternGroupId: binding.patternGroupId,
      exactPatternSpecId: binding.patternSpecIds[0],
      templateFamilyId: binding.templateFamilyId,
      relationEvidence: clone(relationEvidence),
      productionSelectable: true,
      publicQuerySelectable: true,
      productionUse: "allowed",
    },
    metadata: {
      ...clone(question.metadata ?? {}),
      patternId: binding.patternSpecIds[0],
      sourceId: binding.sourceId,
      curriculumNodeIds: [...new Set([...(question.metadata?.curriculumNodeIds ?? []), binding.sourceId])],
      patternTags: [...new Set([
        ...(question.metadata?.patternTags ?? []),
        "fifteen_unit_closeout_application",
        "global_context_application",
      ])],
    },
  };
}

function projectCloseoutQuestion(question, binding, options, index) {
  const specId = binding.patternSpecIds[0];
  const { left, right } = binaryOperands(question);
  const answer = integerAnswer(question);
  const lineage = buildFifteenUnitGlobalContextLineage({
    sourceId: binding.sourceId,
    generationSeed: options.generationSeed,
    sequenceNumber: index + 1,
    patternSpecId: specId,
  });
  const contextName = lineage?.displayNameZh ?? "校園活動";
  if (![left, right, answer].every(Number.isInteger)) return null;

  if (specId === "ps_g4a_u02_3digit_by_1digit_review") {
    return applicationProjection(
      question,
      binding,
      `${contextName}正在整理物資，每箱有${left}件，共有${right}箱。全部共有多少件物資？`,
      `${answer}件`,
      { relation: "EQUAL_GROUPS_TOTAL", perGroup: left, groupCount: right, target: "TOTAL_QUANTITY" },
    );
  }
  if (specId === "ps_g4a_u04_4digit_by_1digit_thousands_exact") {
    return applicationProjection(
      question,
      binding,
      `${contextName}共有${left}件物資，平均分給${right}組。每組可以分到多少件物資？`,
      `${answer}件`,
      { relation: "EQUAL_SHARE", total: left, groupCount: right, target: "PER_GROUP_QUANTITY" },
    );
  }
  if (specId === "ps_g4b_u01_3digit_by_3digit") {
    return applicationProjection(
      question,
      binding,
      `${contextName}每個區域需要${left}件材料，共布置${right}個區域。總共需要多少件材料？`,
      `${answer}件`,
      { relation: "EQUAL_GROUPS_TOTAL", perGroup: left, groupCount: right, target: "TOTAL_QUANTITY" },
    );
  }
  return null;
}

function preserveMathematics(projected, original, binding) {
  if (!projected || projected.patternSpecId !== binding.patternSpecIds[0]) return false;
  if (JSON.stringify(projected.expression ?? null) !== JSON.stringify(original.expression ?? null)) return false;
  if (JSON.stringify(projected.finalAnswer ?? null) !== JSON.stringify(original.finalAnswer ?? null)) return false;
  if (!projected.promptText || /(?:算式|_{2,}|答\s*[:：])/.test(projected.promptText)) return false;
  return projected.applicationText === true && projected.productionUse === "allowed";
}

function questionLooksApplication(question, requestedQuestionMode) {
  if (requestedQuestionMode === "application") return true;
  const corpus = JSON.stringify({
    mode: question?.mode,
    questionMode: question?.questionMode,
    representation: question?.representation,
    applicationText: question?.applicationText,
    metadata: question?.metadata,
    semanticSnapshot: question?.semanticSnapshot,
  }).toLowerCase();
  return corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("controlled_semantic");
}

function attachGlobalContext(question, options, index) {
  const sourceId = question.sourceId
    ?? question.metadata?.sourceId
    ?? question.metadata?.curriculumNodeIds?.[0]
    ?? options.sourceId;
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId ?? null;
  const lineage = buildFifteenUnitGlobalContextLineage({
    sourceId,
    generationSeed: options.generationSeed,
    sequenceNumber: index + 1,
    patternSpecId,
  });
  if (!lineage) return clone(question);
  return {
    ...clone(question),
    sourceId,
    patternSpecId,
    mode: "application",
    questionMode: "application",
    applicationText: true,
    productionUse: "allowed",
    globalContextProduction: clone(lineage),
    metadata: {
      ...clone(question.metadata ?? {}),
      sourceId,
      patternId: patternSpecId,
      globalContextProduction: clone(lineage),
      patternTags: [...new Set([
        ...(question.metadata?.patternTags ?? []),
        "global_context_application",
        lineage.contextFamilyId,
      ])],
      sdgTags: [...new Set([...(question.metadata?.sdgTags ?? []), ...lineage.sdgTags])],
    },
    semanticSnapshot: {
      ...clone(question.semanticSnapshot ?? {}),
      globalContextProduction: clone(lineage),
      runtimeStatus: "production_routed",
    },
  };
}

export function applyFifteenUnitPublicApplicationAdmission(result = {}, options = {}) {
  if (result?.ok !== true || !Array.isArray(result.questions)) return result;
  const selected = listSelectedFifteenUnitPublicApplicationGroups(options.selectedPatternGroupIds ?? []);
  const bindingBySpec = new Map(selected.map((binding) => [binding.patternSpecIds[0], binding]));
  const errors = [];
  let projectedCount = 0;

  const projectedQuestions = result.questions.map((question, index) => {
    const specId = question.patternSpecId ?? question.metadata?.patternId;
    const binding = bindingBySpec.get(specId);
    if (!binding) return clone(question);
    const projected = projectCloseoutQuestion(question, binding, options, index);
    if (!preserveMathematics(projected, question, binding)) {
      errors.push(issue(
        "FIFTEEN_UNIT_APPLICATION_PROJECTION_INVALID",
        `questions[${index}]`,
        "Application projection failed mathematical-preservation or learner-visible prompt validation.",
      ));
      return null;
    }
    projectedCount += 1;
    return projected;
  });

  if (selected.length > 0 && projectedCount === 0) {
    errors.push(issue(
      "FIFTEEN_UNIT_APPLICATION_TARGET_NOT_GENERATED",
      "questions",
      "The selected closeout application group generated no matching PatternSpec question.",
    ));
  }
  if (errors.length > 0) {
    return { ...result, ok: false, questions: [], errors: [...(result.errors ?? []), ...errors] };
  }

  const applicationRequested = options.questionMode === "application"
    || projectedQuestions.some((question) => questionLooksApplication(question, options.questionMode));
  const questions = applicationRequested
    ? projectedQuestions.map((question, index) => attachGlobalContext(question, options, index))
    : projectedQuestions;

  return {
    ...result,
    questions,
    fifteenUnitApplicationAdmission: applicationRequested ? {
      programId: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
      globalContextRegistryId: FIFTEEN_UNIT_GLOBAL_CONTEXT_REGISTRY_ID,
      projectedQuestionCount: projectedCount,
      applicationQuestionCount: questions.filter((question) => question.applicationText === true).length,
      globalContextBoundQuestionCount: questions.filter((question) => question.globalContextProduction?.runtimeResolvable === true).length,
      productionSelectable: true,
      publicQuerySelectable: true,
      productionUse: "allowed",
    } : null,
  };
}

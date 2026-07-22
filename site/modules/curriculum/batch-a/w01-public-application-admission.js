import {
  listSelectedW01PublicApplicationGroups,
} from "../registry/w01-public-application-groups.js";

export const W01_PUBLIC_APPLICATION_ADMISSION = Object.freeze({
  programId: "POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1",
  taskId: "POSTG-APP-W01-PUBLIC-UI_SelectionGeneratorPreviewPrintIntegration",
  admissionTaskId: "POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision",
  evidenceLevel: "E5_PRODUCTION_ADMITTED",
  reviewedDataSha256: "94044b3e6c75c414f6d64ee3bef315164c9a352a8b2b4231171aee0ec0535035",
  reviewedManifestSha256: "595ff5e5fd21ee11eca6f2b2ac28d2d82dabeae9369c25986fa6c9cc55fca6f8",
  publicSelectionEnabled: true,
  publicPreviewEnabled: true,
  publicPrintEnabled: true,
});

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function issue(code, path, message) {
  return { code, severity: "error", stage: "w01_public_application_admission", path, message };
}

function integerAnswer(question) {
  const raw = question?.finalAnswer?.raw?.value
    ?? question?.finalAnswer
    ?? question?.answer
    ?? question?.quotient;
  return Number.isInteger(raw) ? raw : null;
}

function binaryOperands(question) {
  const left = question?.left ?? question?.dividend ?? question?.expression?.left?.value?.raw?.value;
  const right = question?.right ?? question?.divisor ?? question?.expression?.right?.value?.raw?.value;
  return { left, right };
}

function textProjection(question, binding, promptText, answerText, relationEvidence) {
  const admission = {
    ...clone(W01_PUBLIC_APPLICATION_ADMISSION),
    sourceId: binding.sourceId,
    knowledgePointId: binding.primaryKnowledgePointId,
    publicPatternGroupId: binding.patternGroupId,
    exactPatternSpecId: binding.patternSpecIds[0],
    templateFamilyId: binding.templateFamilyId,
    relationEvidence: clone(relationEvidence),
  };
  return {
    ...clone(question),
    knowledgePointId: binding.primaryKnowledgePointId,
    mode: "application",
    representation: "controlled_semantic_application",
    applicationText: true,
    promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} 答案：${answerText}`,
    answerText,
    selectorStatus: "visible",
    visibilityStatus: "visible",
    productionUse: "allowed",
    w01ApplicationAdmission: clone(admission),
    metadata: {
      ...clone(question.metadata ?? {}),
      w01ApplicationAdmission: clone(admission),
      patternTags: [...new Set([...(question.metadata?.patternTags ?? []), "postg_app_w01_e5", "global_context_application"])],
    },
    semanticSnapshot: {
      ...clone(question.semanticSnapshot ?? {}),
      w01ApplicationAdmission: clone(admission),
    },
  };
}

function projectQuestion(question, binding) {
  const specId = binding.patternSpecIds[0];
  const { left, right } = binaryOperands(question);
  const answer = integerAnswer(question);

  if (specId === "ps_g3a_u01_4digit_compare") {
    const symbol = String(question.finalAnswer ?? question.answerText ?? "");
    return textProjection(
      question,
      binding,
      `甲隊有${left}張運動會集點卡，乙隊有${right}張運動會集點卡。比較兩組的數量，應填入哪一個符號：>、< 或 =？`,
      symbol,
      { groupA: "甲隊", groupB: "乙隊", entity: "運動會集點卡", unit: "張", target: "RELATION_SYMBOL" },
    );
  }
  if (specId === "ps_g3a_u01_4digit_range_compare_reasoning") {
    const { lower, upper, choices = {} } = question;
    return textProjection(
      question,
      binding,
      `倉庫規定每批貨物必須超過${lower}箱，而且少於${upper}箱。A批有${choices.A}箱，B批有${choices.B}箱。哪一批符合規定？`,
      String(question.answerText),
      { lowerBound: lower, upperBound: upper, candidates: ["A批", "B批"], entity: "貨物", unit: "箱", target: "SELECTION_ID" },
    );
  }
  if (specId === "ps_g3a_u02_4digit_add_multi_carry") {
    return textProjection(
      question,
      binding,
      `清理小組已記錄${left}個寶特瓶，最後巡查時又發現${right}個寶特瓶。這次一共記錄多少個寶特瓶？`,
      `${answer}個`,
      { eventRelation: "JOIN", entity: "寶特瓶", unit: "個", target: "TOTAL_QUANTITY" },
    );
  }
  if (specId === "ps_g3a_u02_4digit_sub_multi_borrow") {
    return textProjection(
      question,
      binding,
      `校園設計小組原有${left}張節能貼紙，布置活動時用了${right}張節能貼紙。還剩多少張節能貼紙？`,
      `${answer}張`,
      { eventRelation: "SEPARATE", entity: "節能貼紙", unit: "張", target: "REMAINDER_QUANTITY" },
    );
  }
  if (specId === "ps_g3a_u03_2digit_by_1digit_carry") {
    return textProjection(
      question,
      binding,
      `每盤有${left}株幼苗，共有${right}盤。一共有多少株幼苗？`,
      `${answer}株`,
      { entity: "幼苗", unit: "株", groupUnit: "盤", target: "TOTAL_QUANTITY" },
    );
  }
  if (specId === "ps_g3a_u06_exact_division_check") {
    return textProjection(
      question,
      binding,
      `共有${left}公升飲用水，平均分給${right}個水桶。每個水桶分到多少公升飲用水？`,
      `${answer}公升`,
      { entity: "飲用水", unit: "公升", groupUnit: "個水桶", target: "PER_GROUP_QUANTITY" },
    );
  }
  if (specId === "ps_g3b_u01_2digit_by_1digit_regroup_tens") {
    return textProjection(
      question,
      binding,
      `共有${left}顆水餃，平均分給${right}人。每人分到多少顆水餃？`,
      `${answer}顆`,
      { entity: "水餃", unit: "顆", groupUnit: "人", target: "PER_GROUP_QUANTITY" },
    );
  }
  return null;
}

function projectionIsValid(projected, original, binding) {
  if (!projected || projected.patternSpecId !== binding.patternSpecIds[0]) return false;
  if (!projected.promptText || /(?:算式|_{2,}|答\s*[:：])/.test(projected.promptText)) return false;
  if (projected.applicationText !== true || projected.productionUse !== "allowed") return false;
  if (JSON.stringify(projected.expression ?? null) !== JSON.stringify(original.expression ?? null)) return false;
  if (JSON.stringify(projected.finalAnswer ?? null) !== JSON.stringify(original.finalAnswer ?? null)) return false;
  return projected.w01ApplicationAdmission?.reviewedManifestSha256 === W01_PUBLIC_APPLICATION_ADMISSION.reviewedManifestSha256;
}

export function applyW01PublicApplicationAdmission(result = {}, options = {}) {
  const selected = listSelectedW01PublicApplicationGroups(options.selectedPatternGroupIds ?? []);
  if (selected.length === 0 || result?.ok !== true || !Array.isArray(result.questions)) return result;

  const bindingBySpec = new Map(selected.map((binding) => [binding.patternSpecIds[0], binding]));
  const errors = [];
  let projectedCount = 0;
  const questions = result.questions.map((question, index) => {
    const specId = question.patternSpecId ?? question.metadata?.patternId;
    const binding = bindingBySpec.get(specId);
    if (!binding) return clone(question);
    const projected = projectQuestion(question, binding);
    if (!projectionIsValid(projected, question, binding)) {
      errors.push(issue("POSTG_APP_W01_PUBLIC_PROJECTION_INVALID", `questions[${index}]`, "W01 public application projection failed its admission or mathematical-preservation gate."));
      return null;
    }
    projectedCount += 1;
    return projected;
  });

  if (projectedCount === 0) {
    errors.push(issue("POSTG_APP_W01_PUBLIC_TARGET_NOT_GENERATED", "questions", "The selected W01 application group generated no admitted PatternSpec question."));
  }
  if (errors.length > 0) {
    return { ...result, ok: false, questions: [], errors: [...(result.errors ?? []), ...errors] };
  }
  return {
    ...result,
    questions,
    w01ApplicationAdmission: {
      ...clone(W01_PUBLIC_APPLICATION_ADMISSION),
      projectedQuestionCount: projectedCount,
      selectedPublicPatternGroupIds: selected.map((binding) => binding.patternGroupId),
      exactPatternSpecIds: selected.map((binding) => binding.patternSpecIds[0]),
    },
  };
}

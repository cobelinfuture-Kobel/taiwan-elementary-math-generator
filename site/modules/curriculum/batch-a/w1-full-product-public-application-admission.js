import { listSelectedW1FullProductPublicApplicationGroups } from "../registry/w1-full-product-public-application-groups.js";
import { buildFifteenUnitGlobalContextLineage } from "../public/fifteen-unit-global-context-registry.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function issue(code, path, message) {
  return {
    code,
    severity: "error",
    stage: "p01e_w1_public_application_admission",
    path,
    message,
  };
}

function answerText(question) {
  return String(question?.answerText ?? question?.finalAnswer ?? "");
}

function projection(question, binding, options, index, promptText, relationEvidence) {
  const lineage = buildFifteenUnitGlobalContextLineage({
    sourceId: binding.sourceId,
    generationSeed: options.generationSeed,
    sequenceNumber: index + 1,
    patternSpecId: binding.patternSpecIds[0],
  });
  if (!lineage || !promptText || /(?:算式|_{2,}|答\s*[:：])/.test(promptText)) return null;
  const answer = answerText(question);
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
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answer}`,
    answerText: answer,
    productionUse: "allowed",
    globalContextProduction: clone(lineage),
    p01eApplicationAdmission: {
      taskId: "P01E_W1PublicUIHTMLPDFPrintCloseout",
      sourceId: binding.sourceId,
      knowledgePointId: binding.primaryKnowledgePointId,
      publicPatternGroupId: binding.patternGroupId,
      basePatternGroupId: binding.basePatternGroupId,
      exactPatternSpecId: binding.patternSpecIds[0],
      templateFamilyId: binding.templateFamilyId,
      relationEvidence: clone(relationEvidence),
      productionSelectable: true,
      publicQuerySelectable: true,
    },
    metadata: {
      ...clone(question.metadata ?? {}),
      sourceId: binding.sourceId,
      patternId: binding.patternSpecIds[0],
      knowledgePointId: binding.primaryKnowledgePointId,
      patternGroupId: binding.patternGroupId,
      globalContextProduction: clone(lineage),
      patternTags: [...new Set([
        ...(question.metadata?.patternTags ?? []),
        "p01e_w1_public_application",
        "global_context_application",
        lineage.contextFamilyId,
      ])],
      sdgTags: [...new Set([
        ...(question.metadata?.sdgTags ?? []),
        ...lineage.sdgTags,
      ])],
    },
    semanticSnapshot: {
      ...clone(question.semanticSnapshot ?? {}),
      globalContextProduction: clone(lineage),
      relationEvidence: clone(relationEvidence),
      runtimeStatus: "production_routed",
    },
  };
}

function projectQuestion(question, binding, options, index) {
  const spec = binding.patternSpecIds[0];
  const context = buildFifteenUnitGlobalContextLineage({
    sourceId: binding.sourceId,
    generationSeed: options.generationSeed,
    sequenceNumber: index + 1,
    patternSpecId: spec,
  })?.displayNameZh ?? "校園活動";

  if (spec === "ps_g5b_u05a_large_number_digit_value") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}的資料表記錄為 ${question.value}，其中數字 ${question.targetDigit} 在${question.placeLabel}位，表示多少？`,
      {
        relation: "DATA_PLACE_VALUE",
        value: question.value,
        targetDigit: question.targetDigit,
        representedValue: question.representedValue,
      },
    );
  }
  if (spec === "ps_g5b_u05a_large_number_to_chinese") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}公布的統計數字是 ${question.value}，請把這個數寫成中文數字。`,
      {
        relation: "DATA_REPRESENTATION",
        value: question.value,
        conversionDirection: "numeric_to_chinese",
      },
    );
  }
  if (spec === "ps_g5b_u05a_multiply_power_of_ten") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}原有 ${question.base} 個資料單位，擴充為原來的 ${question.factor} 倍後共有多少個資料單位？`,
      {
        relation: "SCALE_BY_POWER_TEN",
        base: question.base,
        factor: question.factor,
        target: question.answerValue,
      },
    );
  }
  if (spec === "ps_g5b_u05a_large_number_expanded_form") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}的統計總數是 ${question.value}，請依各個非零位值把這個數分解成加總形式。`,
      {
        relation: "DECOMPOSE_DATA_TOTAL",
        value: question.value,
        expansion: question.expansion,
      },
    );
  }
  if (spec === "ps_g6a_u01_gcf_direct") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}有 ${question.left} 個紅色物品和 ${question.right} 個藍色物品，要分成最多組，而且每組的紅色與藍色配置都相同。最多可以分成幾組？`,
      {
        relation: "MAX_EQUAL_GROUP_COUNT",
        left: question.left,
        right: question.right,
        gcf: question.gcf,
      },
    );
  }
  if (spec === "ps_g6a_u01_lcm_direct") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}的甲活動每 ${question.left} 天一次，乙活動每 ${question.right} 天一次。兩項活動今天同時進行，至少再過幾天會再次同時進行？`,
      {
        relation: "REPEAT_CYCLE_MEETING",
        leftCycle: question.left,
        rightCycle: question.right,
        lcm: question.lcm,
      },
    );
  }
  if (spec === "ps_g5a_u03a_exact_grouping_yes_no") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}有 ${question.total} 件物品，每 ${question.groupSize} 件裝成一組，能不能剛好裝完？`,
      {
        relation: "EXACT_GROUPING_FEASIBILITY",
        total: question.total,
        groupSize: question.groupSize,
        exact: question.exact,
      },
    );
  }
  if (spec === "ps_g5a_u03a_enumerate_first_multiples") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}每隔 ${question.base} 分鐘記錄一次，從第一次開始列出前 ${question.count} 次記錄時的累計分鐘數。`,
      {
        relation: "REPEATING_INTERVAL_SEQUENCE",
        interval: question.base,
        count: question.count,
        multiples: question.multiples,
      },
    );
  }
  if (spec === "ps_g5a_u03a_list_multiples_in_interval") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}的物品每箱裝 ${question.base} 件。若總量要介於 ${question.start} 件和 ${question.end} 件之間，列出所有可以整箱準備的總量。`,
      {
        relation: "PACKAGE_TOTAL_OPTIONS",
        packageSize: question.base,
        start: question.start,
        end: question.end,
        totals: question.multiples,
      },
    );
  }
  if (spec === "ps_g5a_u03a_count_multiples_in_interval") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}每隔 ${question.base} 天辦理一次。從第 ${question.start} 天到第 ${question.end} 天之間，共會辦理幾次？`,
      {
        relation: "COUNT_REPEATING_EVENTS",
        interval: question.base,
        start: question.start,
        end: question.end,
        eventDays: question.multiples,
      },
    );
  }
  if (spec === "ps_g5a_u03a1_lcm_direct") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}的甲安排每 ${question.left} 天一次，乙安排每 ${question.right} 天一次。今天同時開始，至少幾天後會再次同時進行？`,
      {
        relation: "REPEAT_CYCLE_MEETING",
        leftCycle: question.left,
        rightCycle: question.right,
        lcm: question.lcm,
      },
    );
  }
  if (spec === "ps_g5a_u03a1_bounded_common_multiples") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}有兩項安排，分別每 ${question.left} 天和每 ${question.right} 天一次。列出第 ${question.start} 天到第 ${question.end} 天之間同時發生的日期。`,
      {
        relation: "COMMON_SCHEDULE_OPTIONS",
        leftCycle: question.left,
        rightCycle: question.right,
        start: question.start,
        end: question.end,
        commonDays: question.multiples,
      },
    );
  }
  if (spec === "ps_g5a_u03a1_minimum_common_group_total") {
    return projection(
      question,
      binding,
      options,
      index,
      `${context}的物品可以每 ${question.left} 件一組，也可以每 ${question.right} 件一組，兩種方式都要剛好分完。最少需要多少件物品？`,
      {
        relation: "MINIMUM_COMMON_TOTAL",
        firstGroupSize: question.left,
        secondGroupSize: question.right,
        minimumTotal: question.lcm,
      },
    );
  }
  return null;
}

export function applyW1FullProductPublicApplicationAdmission(result = {}, options = {}) {
  if (result?.ok !== true || !Array.isArray(result.questions) || options.questionMode !== "application") {
    return result;
  }
  const selected = listSelectedW1FullProductPublicApplicationGroups(
    options.selectedPatternGroupIds ?? [],
  );
  if (selected.length === 0) return result;
  const bindingBySpec = new Map(
    selected.map((binding) => [binding.patternSpecIds[0], binding]),
  );
  const errors = [];
  let projectedCount = 0;
  const questions = result.questions.map((question, index) => {
    const spec = question.patternSpecId ?? question.metadata?.patternId;
    const binding = bindingBySpec.get(spec);
    if (!binding) return clone(question);
    const projected = projectQuestion(question, binding, options, index);
    if (
      !projected
      || projected.patternSpecId !== spec
      || String(projected.answerText) !== String(question.answerText)
      || JSON.stringify(projected.finalAnswer ?? null) !== JSON.stringify(question.finalAnswer ?? null)
    ) {
      errors.push(issue(
        "P01E_APPLICATION_PROJECTION_INVALID",
        `questions[${index}]`,
        `Application projection failed for ${spec}.`,
      ));
      return null;
    }
    projectedCount += 1;
    return projected;
  });
  if (projectedCount !== questions.length) {
    errors.push(issue(
      "P01E_APPLICATION_COVERAGE_INCOMPLETE",
      "questions",
      `Projected ${projectedCount} of ${questions.length} questions.`,
    ));
  }
  if (errors.length > 0) {
    return {
      ...result,
      ok: false,
      questions: [],
      errors: [...(result.errors ?? []), ...errors],
    };
  }
  return {
    ...result,
    questions,
    p01eApplicationAdmission: {
      taskId: "P01E_W1PublicUIHTMLPDFPrintCloseout",
      selectedApplicationGroupCount: selected.length,
      projectedQuestionCount: projectedCount,
      globalContextBoundQuestionCount: questions.filter(
        (question) => question.globalContextProduction?.runtimeResolvable === true,
      ).length,
      applicationKnowledgePointIds: [...new Set(
        selected.map((row) => row.primaryKnowledgePointId),
      )],
      productionSelectable: true,
      publicQuerySelectable: true,
    },
  };
}

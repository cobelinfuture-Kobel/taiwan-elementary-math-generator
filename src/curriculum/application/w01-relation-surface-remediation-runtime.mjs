import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW01E4ProductionReview,
  validateW01E4ProductionReview
} from './w01-e4-production-review-runtime.mjs';
import {
  materializeW01SemanticClassQuantitySchemaRuntime,
  validateW01SemanticClassQuantitySchemaRuntime
} from './w01-semantic-class-quantity-schema-runtime.mjs';

const POLICY_PATH = 'data/curriculum/application/contracts/w01-relation-surface-remediation-policy.json';
const TASK_ID = 'POSTG-APP-W01-A06C_RelationSpecificSurfaceTemplatesAndTitleSuppression';
const GENERATION_SEED = 'postg-app-w01-a06c-relation-surfaces';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function normalizePrompt(value, policy) {
  let output = String(value ?? '').replace(/\s+/g, ' ').trim();
  for (const fragment of policy.naturalPromptCleanup.removeTrailingFragments ?? []) {
    if (output.endsWith(fragment)) output = output.slice(0, -fragment.length).trim();
  }
  return output
    .replace(/(\d)\s+(?=[\u4e00-\u9fff])/gu, '$1')
    .replace(/\s+([，。？！：；])/gu, '$1')
    .replace(/，{2,}/gu, '，')
    .replace(/。{2,}/gu, '。')
    .trim();
}

function extractNumberTokens(text) {
  return [...String(text ?? '').matchAll(/\d[\d,]*/gu)].map((match) => ({
    raw: match[0],
    value: match[0].replaceAll(',', '').replace(/^0+(?=\d)/u, '')
  }));
}

function canonicalNumberMultiset(text) {
  return extractNumberTokens(text).map((row) => row.value).sort((left, right) => (
    left.length - right.length || left.localeCompare(right)
  ));
}

function canonicalNumberFacts(semanticClass, text) {
  const values = canonicalNumberMultiset(text);
  return semanticClass === 'COMPARE_TWO_GROUPS_SAME_MEASURE'
    ? [...new Set(values)]
    : values;
}

function numberFactMultisetEqual(semanticClass, left, right) {
  return JSON.stringify(canonicalNumberFacts(semanticClass, left))
    === JSON.stringify(canonicalNumberFacts(semanticClass, right));
}

function exactMathSnapshot(question = {}) {
  return {
    expression: clone(question.expression ?? null),
    finalAnswer: clone(question.finalAnswer ?? null),
    answerText: question.answerText ?? null,
    left: question.left ?? null,
    right: question.right ?? null,
    result: question.result ?? null,
    quantities: clone(question.quantities ?? null),
    equationModel: question.equationModel ?? null,
    operatorsUsed: clone(question.operatorsUsed ?? null),
    intermediateResults: clone(question.intermediateResults ?? null),
    patternSpecId: question.patternSpecId ?? question.metadata?.patternId ?? null
  };
}

function numberValues(originalPrompt) {
  return extractNumberTokens(originalPrompt).map((row) => row.value);
}

function quantityFact(value, entity, unit, role) {
  return { value: String(value), entity, unit, role };
}

function profileFor(descriptor, policy) {
  return policy.scenarioProfiles[descriptor.contextMetadata.macroContextId] ?? null;
}

function numericPreservedSurface(descriptor, originalPrompt, policy) {
  return {
    surfaceMode: descriptor.suitability === 'NUMERIC_ONLY'
      ? 'NUMERIC_PRESERVED'
      : 'NUMERIC_PRESERVED_PENDING_SURFACE_ADMISSION',
    templateFamilyId: policy.templateFamilyBySemanticClass[descriptor.semanticClass],
    promptText: normalizePrompt(originalPrompt, policy),
    answerUnit: null,
    quantityFacts: [],
    relationEvidence: {
      preservationReason: descriptor.suitability
    }
  };
}

function compareSurface(descriptor, originalPrompt, policy) {
  const [left, right] = numberValues(originalPrompt);
  const profile = profileFor(descriptor, policy);
  const actorA = profile?.actorA ?? '甲組';
  const actorB = profile?.actorB ?? '乙組';
  const entity = profile?.entity ?? '物品';
  const unit = profile?.unit ?? '個';
  return {
    surfaceMode: 'RELATION_APPLICATION',
    templateFamilyId: 'REL_COMPARE_TWO_GROUPS_V1',
    promptText: `${actorA}有${left}${unit}${entity}，${actorB}有${right}${unit}${entity}。比較兩組的數量，應填入哪一個符號：>、< 或 =？`,
    answerUnit: null,
    quantityFacts: [
      quantityFact(left, entity, unit, 'leftGroupQuantity'),
      quantityFact(right, entity, unit, 'rightGroupQuantity')
    ],
    relationEvidence: {
      groupA: actorA,
      groupB: actorB,
      entity,
      unit,
      target: 'RELATION_SYMBOL'
    }
  };
}

function rangeSurface(descriptor, originalPrompt, policy) {
  const [lowerBound, upperBound, candidateAValue, candidateBValue] = numberValues(originalPrompt);
  const profile = profileFor(descriptor, policy);
  const entity = profile?.entity ?? '貨物';
  const unit = profile?.unit ?? '箱';
  const candidateA = profile?.candidateA ?? 'A批';
  const candidateB = profile?.candidateB ?? 'B批';
  return {
    surfaceMode: 'RELATION_APPLICATION',
    templateFamilyId: 'REL_RANGE_MEMBERSHIP_V1',
    promptText: `倉庫規定每批${entity}必須超過${lowerBound}${unit}，而且少於${upperBound}${unit}。${candidateA}有${candidateAValue}${unit}，${candidateB}有${candidateBValue}${unit}。哪一批符合規定？`,
    answerUnit: null,
    quantityFacts: [
      quantityFact(lowerBound, entity, unit, 'lowerBound'),
      quantityFact(upperBound, entity, unit, 'upperBound'),
      quantityFact(candidateAValue, entity, unit, 'candidateA'),
      quantityFact(candidateBValue, entity, unit, 'candidateB')
    ],
    relationEvidence: {
      lowerBound,
      upperBound,
      candidates: [candidateA, candidateB],
      entity,
      unit,
      target: 'SELECTION_ID'
    }
  };
}

function joinSurface(descriptor, originalPrompt, policy) {
  const [initial, joined] = numberValues(originalPrompt);
  const profile = profileFor(descriptor, policy);
  const actor = profile?.actor ?? '工作人員';
  const entity = profile?.entity ?? '物品';
  const unit = profile?.unit ?? '個';
  return {
    surfaceMode: 'RELATION_APPLICATION',
    templateFamilyId: 'REL_JOIN_TOTAL_V1',
    promptText: `${actor}已記錄${initial}${unit}${entity}，最後巡查時又發現${joined}${unit}${entity}。這次一共記錄多少${unit}${entity}？`,
    answerUnit: unit,
    quantityFacts: [
      quantityFact(initial, entity, unit, 'initialQuantity'),
      quantityFact(joined, entity, unit, 'joinedQuantity')
    ],
    relationEvidence: {
      eventRelation: 'JOIN',
      entity,
      unit,
      target: 'TOTAL_QUANTITY'
    }
  };
}

function separateSurface(descriptor, originalPrompt, policy) {
  const [initial, removed] = numberValues(originalPrompt);
  const profile = profileFor(descriptor, policy);
  const actor = profile?.actor ?? '工作人員';
  const entity = profile?.entity ?? '物品';
  const unit = profile?.unit ?? '個';
  return {
    surfaceMode: 'RELATION_APPLICATION',
    templateFamilyId: 'REL_SEPARATE_REMAINDER_V1',
    promptText: `${actor}原有${initial}${unit}${entity}，布置活動時用了${removed}${unit}${entity}。還剩多少${unit}${entity}？`,
    answerUnit: unit,
    quantityFacts: [
      quantityFact(initial, entity, unit, 'initialQuantity'),
      quantityFact(removed, entity, unit, 'removedQuantity')
    ],
    relationEvidence: {
      eventRelation: 'SEPARATE',
      entity,
      unit,
      target: 'REMAINDER_QUANTITY'
    }
  };
}

function equalGroupsSurface(descriptor, originalPrompt, policy) {
  const [perGroup, groupCount] = numberValues(originalPrompt);
  const profile = profileFor(descriptor, policy);
  const entity = profile?.entity ?? '物品';
  const unit = profile?.unit ?? '個';
  const groupUnit = profile?.groupUnit ?? '組';
  return {
    surfaceMode: 'RELATION_APPLICATION',
    templateFamilyId: 'REL_EQUAL_GROUPS_TOTAL_V1',
    promptText: `每${groupUnit}有${perGroup}${unit}${entity}，共有${groupCount}${groupUnit}。一共有多少${unit}${entity}？`,
    answerUnit: unit,
    quantityFacts: [
      quantityFact(perGroup, entity, unit, 'perGroupQuantity'),
      quantityFact(groupCount, groupUnit, groupUnit, 'groupCount')
    ],
    relationEvidence: {
      entity,
      unit,
      groupUnit,
      target: 'TOTAL_QUANTITY'
    }
  };
}

function equalShareSurface(descriptor, originalPrompt, policy) {
  const [total, groupCount] = numberValues(originalPrompt);
  const profile = profileFor(descriptor, policy);
  const entity = profile?.entity ?? '物品';
  const unit = profile?.unit ?? '個';
  const groupUnit = profile?.groupUnit ?? '組';
  return {
    surfaceMode: 'RELATION_APPLICATION',
    templateFamilyId: 'REL_EQUAL_SHARE_V1',
    promptText: `共有${total}${unit}${entity}，平均分給${groupCount}${groupUnit}。每${groupUnit}分到多少${unit}${entity}？`,
    answerUnit: unit,
    quantityFacts: [
      quantityFact(total, entity, unit, 'totalQuantity'),
      quantityFact(groupCount, groupUnit, groupUnit, 'groupCount')
    ],
    relationEvidence: {
      entity,
      unit,
      groupUnit,
      target: 'PER_GROUP_QUANTITY'
    }
  };
}

function floorSurface(descriptor, originalPrompt, policy) {
  const [total, capacity] = numberValues(originalPrompt);
  const profile = profileFor(descriptor, policy);
  const entity = profile?.entity ?? '物品';
  const unit = profile?.unit ?? '個';
  const groupUnit = profile?.groupUnit ?? '盒';
  return {
    surfaceMode: 'RELATION_APPLICATION',
    templateFamilyId: 'REL_COMPLETE_GROUPS_FLOOR_V1',
    promptText: `物資整理小組有${total}${unit}${entity}，每${groupUnit}裝${capacity}${unit}。最多可以裝滿幾${groupUnit}？`,
    answerUnit: groupUnit,
    quantityFacts: [
      quantityFact(total, entity, unit, 'totalQuantity'),
      quantityFact(capacity, entity, unit, 'groupCapacity')
    ],
    relationEvidence: {
      entity,
      unit,
      groupUnit,
      remainderPolicy: 'REMAINDER_NOT_COUNTED_AS_COMPLETE_GROUP',
      target: 'COMPLETE_GROUP_COUNT'
    }
  };
}

function preservedApplicationSurface(descriptor, originalPrompt, policy) {
  const promptText = normalizePrompt(originalPrompt, policy);
  const numbers = numberValues(promptText);
  const patternSpecId = descriptor.exactPatternSpecId;
  if (patternSpecId === 'ps_g3b_u04_add_divide_joint_purchase_equal_share') {
    return {
      surfaceMode: 'RELATION_APPLICATION_PRESERVED',
      templateFamilyId: 'REL_EXISTING_JOINT_PURCHASE_EQUAL_SHARE_V1',
      promptText,
      answerUnit: '元',
      quantityFacts: [
        quantityFact(numbers[0], '同學', '人', 'participantCount'),
        quantityFact(numbers[1], '場地使用費', '元', 'costA'),
        quantityFact(numbers[2], '器材租借費', '元', 'costB'),
        quantityFact(numbers[3], '同學', '人', 'shareCount')
      ],
      relationEvidence: { target: 'PER_PERSON_COST', preservedAuthenticApplication: true }
    };
  }
  if (patternSpecId === 'ps_g3b_u08_total_daily_saving_accumulation') {
    return {
      surfaceMode: 'RELATION_APPLICATION_PRESERVED',
      templateFamilyId: 'REL_EXISTING_DAILY_SAVING_TOTAL_V1',
      promptText,
      answerUnit: '元',
      quantityFacts: [
        quantityFact(numbers[0], '每日存款', '元', 'perDayAmount'),
        quantityFact(numbers[1], '天數', '天', 'dayCount')
      ],
      relationEvidence: { target: 'TOTAL_SAVING', preservedAuthenticApplication: true }
    };
  }
  if (patternSpecId === 'ps_g5a_u02_equal_partition_all_segment_counts') {
    return {
      surfaceMode: 'RELATION_APPLICATION_PRESERVED',
      templateFamilyId: 'REL_EXISTING_EQUAL_PARTITION_PAIR_SET_V1',
      promptText,
      answerUnit: null,
      quantityFacts: [quantityFact(numbers[0], '緞帶長度', '公尺', 'totalLength')],
      relationEvidence: { target: 'ALL_PARTITION_PAIRS', preservedAuthenticApplication: true }
    };
  }
  throw new Error(`Unsupported preserved PatternSpec: ${patternSpecId}`);
}

function specificOverrideSurface(descriptor, originalPrompt) {
  const values = numberValues(originalPrompt);
  if (descriptor.exactPatternSpecId === 'ps_g4a_u08_app_adjusted_amount_then_subtract') {
    return {
      surfaceMode: 'RELATION_APPLICATION',
      templateFamilyId: 'REL_TICKET_DISCOUNT_CHANGE_V1',
      promptText: `一張公車票原價${values[0]}元，活動折扣${values[1]}元。小明付了${values[2]}元，可以找回多少元？`,
      answerUnit: '元',
      quantityFacts: [
        quantityFact(values[0], '公車票原價', '元', 'originalPrice'),
        quantityFact(values[1], '折扣', '元', 'discount'),
        quantityFact(values[2], '付款金額', '元', 'payment')
      ],
      relationEvidence: { target: 'CHANGE_AFTER_DISCOUNT', steps: ['ADJUST_PRICE', 'SUBTRACT_FROM_PAYMENT'] }
    };
  }
  if (descriptor.exactPatternSpecId === 'ps_g5a_u08_app_group_select') {
    return {
      surfaceMode: 'RELATION_APPLICATION',
      templateFamilyId: 'REL_GROUP_SELECT_FROM_EQUAL_BOXES_V1',
      promptText: `共有${values[0]}顆球，平均裝成${values[1]}箱。取出其中${values[2]}箱，取出的球共有多少顆？`,
      answerUnit: '顆',
      quantityFacts: [
        quantityFact(values[0], '球', '顆', 'totalQuantity'),
        quantityFact(values[1], '箱', '箱', 'totalGroupCount'),
        quantityFact(values[2], '箱', '箱', 'selectedGroupCount')
      ],
      relationEvidence: { target: 'SELECTED_GROUP_QUANTITY', steps: ['EQUAL_SHARE', 'SELECT_GROUPS'] }
    };
  }
  throw new Error(`Unsupported specific PatternSpec override: ${descriptor.exactPatternSpecId}`);
}

function buildSurface(descriptor, originalPrompt, policy) {
  if (descriptor.suitability !== 'APPLICATION_REQUIRED') {
    return numericPreservedSurface(descriptor, originalPrompt, policy);
  }
  if (policy.preserveAuthenticApplicationPatternSpecs.includes(descriptor.exactPatternSpecId)) {
    return preservedApplicationSurface(descriptor, originalPrompt, policy);
  }
  if (Object.hasOwn(policy.specificPatternOverrides, descriptor.exactPatternSpecId)) {
    return specificOverrideSurface(descriptor, originalPrompt);
  }
  switch (descriptor.semanticClass) {
    case 'COMPARE_TWO_GROUPS_SAME_MEASURE': return compareSurface(descriptor, originalPrompt, policy);
    case 'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE': return rangeSurface(descriptor, originalPrompt, policy);
    case 'JOIN_RESULT_TOTAL': return joinSurface(descriptor, originalPrompt, policy);
    case 'SEPARATE_REMAINDER_OR_DIFFERENCE': return separateSurface(descriptor, originalPrompt, policy);
    case 'EQUAL_GROUPS_TOTAL': return equalGroupsSurface(descriptor, originalPrompt, policy);
    case 'EQUAL_SHARE_PER_GROUP': return equalShareSurface(descriptor, originalPrompt, policy);
    case 'COMPLETE_GROUP_COUNT_FLOOR': return floorSurface(descriptor, originalPrompt, policy);
    default:
      return numericPreservedSurface(descriptor, originalPrompt, policy);
  }
}

function buildRemediatedRow(descriptor, a05Row, policy) {
  const originalPrompt = normalizePrompt(
    descriptor.reviewPair?.originalPrompt ?? a05Row.originalPrompt,
    policy
  );
  const surface = buildSurface(descriptor, originalPrompt, policy);
  const beforeSnapshot = exactMathSnapshot(a05Row.transformed);
  const transformed = {
    ...clone(a05Row.transformed),
    id: String(a05Row.transformed.id).replace('postg-app-w01-a05-', 'postg-app-w01-a06c-'),
    promptText: surface.promptText,
    blankedDisplayText: surface.promptText,
    displayText: `${surface.promptText} ${a05Row.transformed.answerText ?? ''}`.trim(),
    answerUnit: surface.answerUnit,
    productionUse: 'forbidden_pending_second_human_review',
    selectorStatus: 'hidden',
    visibilityStatus: 'hidden',
    applicationReview: {
      ...(clone(a05Row.transformed.applicationReview) ?? {}),
      taskId: TASK_ID,
      reviewMode: 'postg_app_w01_a06c_relation_surface_remediation',
      previousReviewTaskId: 'POSTG-APP-W01-A05_UnitFlowExactGeneratorRendererAndHumanReviewRemediation',
      humanReviewDecision: 'REMEDIATION_REQUIRED',
      semanticClass: descriptor.semanticClass,
      suitability: descriptor.suitability,
      templateFamilyId: surface.templateFamilyId,
      surfaceMode: surface.surfaceMode,
      visibleTitle: null,
      quantityFacts: clone(surface.quantityFacts),
      relationEvidence: clone(surface.relationEvidence),
      humanNaturalnessReviewRequired: true,
      humanReviewReady: false,
      productionAdmissionAllowed: false
    },
    metadata: {
      ...(clone(a05Row.transformed.metadata) ?? {}),
      applicationReviewTaskId: TASK_ID,
      applicationSemanticClass: descriptor.semanticClass,
      applicationSuitability: descriptor.suitability,
      applicationTemplateFamilyId: surface.templateFamilyId,
      applicationSurfaceMode: surface.surfaceMode,
      contextMacroVisibleTitle: false
    },
    semanticSnapshot: {
      ...(clone(a05Row.transformed.semanticSnapshot) ?? {}),
      applicationRemediation: {
        taskId: TASK_ID,
        semanticClass: descriptor.semanticClass,
        suitability: descriptor.suitability,
        quantitySchema: clone(descriptor.quantitySchema),
        answerSchema: clone(descriptor.answerSchema),
        quantityFacts: clone(surface.quantityFacts),
        relationEvidence: clone(surface.relationEvidence),
        humanNaturalnessReviewRequired: true,
        productionAdmissionAllowed: false
      }
    }
  };
  const afterSnapshot = exactMathSnapshot(transformed);
  return {
    bindingCandidateId: descriptor.bindingCandidateId,
    sourceId: descriptor.sourceId,
    knowledgePointId: descriptor.knowledgePointId,
    exactPatternSpecId: descriptor.exactPatternSpecId,
    exactPatternGroupId: descriptor.exactPatternGroupId,
    semanticClass: descriptor.semanticClass,
    suitability: descriptor.suitability,
    oldReviewPrompt: a05Row.reviewPrompt,
    originalPrompt,
    remediatedPrompt: surface.promptText,
    visibleTitle: null,
    surface,
    transformed,
    beforeSnapshot,
    afterSnapshot,
    mathPreserved: JSON.stringify(beforeSnapshot) === JSON.stringify(afterSnapshot),
    numberMultisetPreserved: numberFactMultisetEqual(
      descriptor.semanticClass,
      originalPrompt,
      surface.promptText
    ),
    promptChangedFromRejectedA05: surface.promptText !== a05Row.reviewPrompt,
    productionAdmissionAllowed: false
  };
}

function hasForbiddenVisiblePattern(prompt, policy) {
  return policy.forbiddenVisiblePatterns.some((pattern) => new RegExp(pattern, 'u').test(prompt));
}

function validateQuantityFacts(row, issues) {
  if (row.surface.surfaceMode.startsWith('NUMERIC_PRESERVED')) return;
  for (const [index, fact] of row.surface.quantityFacts.entries()) {
    const visibleToken = `${fact.value}${fact.unit}`;
    if (!row.remediatedPrompt.includes(visibleToken)) {
      issues.push(issue('APPSEM_VISIBLE_QUANTITY_BINDING_MISSING', row.bindingCandidateId, {
        factIndex: index,
        value: fact.value,
        unit: fact.unit
      }));
    }
    if (['份', 'UNBOUND_UNIT_CANDIDATE'].includes(fact.unit)) {
      issues.push(issue('APPSEM_GENERIC_VISIBLE_UNIT_FORBIDDEN', row.bindingCandidateId, {
        factIndex: index,
        unit: fact.unit
      }));
    }
  }
}

function validateRelationEvidence(row, issues) {
  const evidence = row.surface.relationEvidence ?? {};
  if (row.semanticClass === 'COMPARE_TWO_GROUPS_SAME_MEASURE') {
    if (!evidence.groupA || !evidence.groupB || !evidence.entity || !evidence.unit || evidence.target !== 'RELATION_SYMBOL') {
      issues.push(issue('APPSEM_COMPARE_GROUP_SCHEMA_REQUIRED', row.bindingCandidateId));
    }
  }
  if (row.semanticClass === 'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE') {
    if (!evidence.lowerBound || !evidence.upperBound || evidence.candidates?.length < 2 || evidence.target !== 'SELECTION_ID') {
      issues.push(issue('APPSEM_RANGE_BOUND_SCHEMA_REQUIRED', row.bindingCandidateId));
    }
  }
  if (row.semanticClass === 'JOIN_RESULT_TOTAL' && evidence.target !== 'TOTAL_QUANTITY') {
    issues.push(issue('APPSEM_RELATION_TARGET_MISMATCH', row.bindingCandidateId));
  }
  if (row.semanticClass === 'SEPARATE_REMAINDER_OR_DIFFERENCE' && evidence.target !== 'REMAINDER_QUANTITY') {
    issues.push(issue('APPSEM_RELATION_TARGET_MISMATCH', row.bindingCandidateId));
  }
  if (row.semanticClass === 'COMPLETE_GROUP_COUNT_FLOOR'
      && evidence.remainderPolicy !== 'REMAINDER_NOT_COUNTED_AS_COMPLETE_GROUP') {
    issues.push(issue('APPSEM_FLOOR_REMAINDER_POLICY_REQUIRED', row.bindingCandidateId));
  }
}

export function materializeW01RelationSurfaceRemediationRuntime({ root = process.cwd() } = {}) {
  const policy = readJson(root, POLICY_PATH);
  const semanticRuntime = materializeW01SemanticClassQuantitySchemaRuntime({ root });
  const semanticValidation = validateW01SemanticClassQuantitySchemaRuntime(semanticRuntime);
  const a05 = materializeW01E4ProductionReview({
    generationSeed: semanticRuntime.a05ReviewData.generationSeed ?? GENERATION_SEED
  });
  const a05Validation = validateW01E4ProductionReview(a05);
  const descriptorByBindingCandidateId = new Map(
    semanticRuntime.reviewDescriptors.map((row) => [row.bindingCandidateId, row])
  );
  const a05RowsByBindingCandidateId = new Map(
    a05.transformedRows.map((row) => [row.candidate.bindingCandidateId, row])
  );
  const rows = semanticRuntime.a05ReviewData.reviewPairs.map((reviewPair) => {
    const descriptor = descriptorByBindingCandidateId.get(reviewPair.bindingCandidateId);
    const a05Row = a05RowsByBindingCandidateId.get(reviewPair.bindingCandidateId);
    if (!descriptor || !a05Row) {
      return {
        bindingCandidateId: reviewPair.bindingCandidateId,
        joinFailure: true,
        productionAdmissionAllowed: false
      };
    }
    return buildRemediatedRow(descriptor, a05Row, policy);
  });
  return {
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: TASK_ID,
    status: 'RELATION_SPECIFIC_SURFACE_SHADOW_RUNTIME_READY',
    actualEvidenceLevel: 'E3_SHADOW_RUNTIME_INTEGRATED',
    generationSeed: semanticRuntime.a05ReviewData.generationSeed ?? GENERATION_SEED,
    productionAdmissionAllowed: false,
    policy,
    semanticRuntime,
    semanticValidation,
    a05,
    a05Validation,
    rows
  };
}

export function validateW01RelationSurfaceRemediationRuntime(materialized) {
  const issues = [];
  const rows = materialized.rows ?? [];
  if (!materialized.semanticValidation?.ok) {
    issues.push(issue('POSTG_APP_W01_A06C_SEMANTIC_RUNTIME_INVALID', 'semanticRuntime', {
      issues: materialized.semanticValidation?.structuralIssues ?? []
    }));
  }
  if (!materialized.a05Validation?.ok) {
    issues.push(issue('POSTG_APP_W01_A06C_A05_RUNTIME_INVALID', 'a05', {
      issues: materialized.a05Validation?.issues ?? []
    }));
  }
  if (rows.length !== 16 || rows.some((row) => row.joinFailure)) {
    issues.push(issue('POSTG_APP_W01_A06C_REVIEW_JOIN_INCOMPLETE', 'rows', {
      rowCount: rows.length,
      joinFailureCount: rows.filter((row) => row.joinFailure).length
    }));
  }
  for (const row of rows.filter((candidate) => !candidate.joinFailure)) {
    if (!row.mathPreserved) issues.push(issue('APPSEM_MATHEMATICAL_WITNESS_DRIFT', row.bindingCandidateId));
    if (!row.numberMultisetPreserved) issues.push(issue('APPSEM_NUMERIC_FACT_DRIFT', row.bindingCandidateId, {
      originalNumbers: canonicalNumberMultiset(row.originalPrompt),
      remediatedNumbers: canonicalNumberMultiset(row.remediatedPrompt)
    }));
    if (!row.promptChangedFromRejectedA05) issues.push(issue('APPSEM_REJECTED_PROMPT_NOT_REMEDIATED', row.bindingCandidateId));
    if (row.visibleTitle !== null || row.transformed.applicationReview?.visibleTitle !== null) {
      issues.push(issue('APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN', row.bindingCandidateId));
    }
    if (hasForbiddenVisiblePattern(row.remediatedPrompt, materialized.policy)) {
      issues.push(issue('APPSEM_FORBIDDEN_VISIBLE_PATTERN', row.bindingCandidateId, {
        remediatedPrompt: row.remediatedPrompt
      }));
    }
    if (row.suitability !== 'APPLICATION_REQUIRED') {
      if (!row.surface.surfaceMode.startsWith('NUMERIC_PRESERVED') || row.remediatedPrompt !== row.originalPrompt) {
        issues.push(issue('APPSEM_FORCED_APPLICATION_FOR_NUMERIC_ONLY', row.bindingCandidateId));
      }
    }
    validateQuantityFacts(row, issues);
    validateRelationEvidence(row, issues);
    if (row.transformed.applicationReview?.humanNaturalnessReviewRequired !== true) {
      issues.push(issue('APPSEM_HUMAN_NATURALNESS_REVIEW_REQUIRED', row.bindingCandidateId));
    }
    if (row.productionAdmissionAllowed !== false
        || row.transformed.applicationReview?.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W01_A06C_PRODUCTION_ADMISSION_FORBIDDEN', row.bindingCandidateId));
    }
  }
  const counts = {
    reviewRowCount: rows.length,
    issueCount: issues.length,
    mathPreservedCount: rows.filter((row) => row.mathPreserved).length,
    numberMultisetPreservedCount: rows.filter((row) => row.numberMultisetPreserved).length,
    promptChangedCount: rows.filter((row) => row.promptChangedFromRejectedA05).length,
    numericPreservedCount: rows.filter((row) => row.surface?.surfaceMode?.startsWith('NUMERIC_PRESERVED')).length,
    applicationSurfaceCount: rows.filter((row) => row.surface?.surfaceMode?.startsWith('RELATION_APPLICATION')).length,
    visibleTitleCount: rows.filter((row) => row.visibleTitle != null).length,
    humanNaturalnessGateCount: rows.filter((row) => row.transformed?.applicationReview?.humanNaturalnessReviewRequired === true).length
  };
  return {
    ok: issues.length === 0,
    issues,
    counts,
    status: issues.length === 0
      ? 'RELATION_SPECIFIC_SURFACE_SHADOW_RUNTIME_VALID'
      : 'RELATION_SPECIFIC_SURFACE_SHADOW_RUNTIME_INVALID',
    productionReady: false,
    productionAdmissionAllowed: false
  };
}

export function buildW01RelationSurfaceRemediationReadback(options = {}) {
  const materialized = materializeW01RelationSurfaceRemediationRuntime(options);
  const validation = validateW01RelationSurfaceRemediationRuntime(materialized);
  return {
    taskId: materialized.taskId,
    status: validation.status,
    actualEvidenceLevel: materialized.actualEvidenceLevel,
    ok: validation.ok,
    productionReady: false,
    productionAdmissionAllowed: false,
    counts: clone(validation.counts),
    issues: clone(validation.issues),
    reviewRows: clone(materialized.rows.map((row) => ({
      bindingCandidateId: row.bindingCandidateId,
      sourceId: row.sourceId,
      knowledgePointId: row.knowledgePointId,
      exactPatternSpecId: row.exactPatternSpecId,
      semanticClass: row.semanticClass,
      suitability: row.suitability,
      surfaceMode: row.surface?.surfaceMode,
      templateFamilyId: row.surface?.templateFamilyId,
      originalPrompt: row.originalPrompt,
      rejectedA05Prompt: row.oldReviewPrompt,
      remediatedPrompt: row.remediatedPrompt,
      answerUnit: row.surface?.answerUnit,
      quantityFacts: row.surface?.quantityFacts,
      mathPreserved: row.mathPreserved,
      numberMultisetPreserved: row.numberMultisetPreserved,
      humanNaturalnessReviewRequired: true
    }))),
    nextShortestStep: 'POSTG-APP-W01-A06D_RegeneratedHTMLPDFHumanReviewPackage'
  };
}

import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW02AtomicContextSingleApplicationCandidatePack,
  validateW02AtomicContextSingleApplicationCandidatePack
} from './w02-atomic-context-single-application-candidate-pack.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w02-nplusone-pbl-candidate-policy.json';
const PACK_INDEX_PATH = 'data/curriculum/application/assessment/w02-nplusone-pbl-candidate-pack-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;
const normalize = (parts) => parts.flat(Infinity).filter(Boolean).join(' ').toLowerCase();
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
const countBy = (rows, selector) => rows.reduce((counts, row) => {
  const key = selector(row);
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function inferInterpretiveAct({ sourceRow, candidate, policy }) {
  const corpus = normalize([
    sourceRow.sourceId,
    sourceRow.sourceTitle,
    sourceRow.domainFamily,
    sourceRow.knowledgePoint?.knowledgePointId,
    sourceRow.knowledgePoint?.knowledgePointName,
    sourceRow.knowledgePoint?.scope,
    sourceRow.operationModel?.operationFamilyId,
    sourceRow.operationModel?.answerType,
    sourceRow.operationModel?.canonicalExpressions,
    sourceRow.operationModel?.validationInvariants,
    Object.values(sourceRow.operationModel?.operandRoles ?? {}),
    sourceRow.patternSpec?.requestedUnknownRole,
    sourceRow.patternSpec?.givenRoles,
    candidate.answerModelCandidate.answerShape,
    candidate.validationCandidate.contextConstraints,
    candidate.contextSelection.facetRefs
  ]);
  const matched = policy.interpretiveActRules.find((rule) => (
    rule.tokens.some((token) => corpus.includes(String(token).toLowerCase()))
  ));
  return matched?.act ?? policy.fallbackInterpretiveAct;
}

function actDetails(act, candidate) {
  const target = candidate.targetRoleCandidate.mathSemanticMeaning;
  const constraint = candidate.validationCandidate.contextConstraints[0] ?? '情境限制';
  const map = {
    UNKNOWN_ROLE_SHIFT: {
      forkPoint: '要找的量由直接結果改為另一個未知角色',
      valid: `先辨認${target}是新的未知角色，再選擇反推關係`,
      invalid: '沿用原本直接題目的答案角色',
      condition: '題目問句與已知量角色改變',
      counterfactual: '把未知角色改回直接可求的結果'
    },
    REMAINDER_INTERPRETATION: {
      forkPoint: '得到商與餘數後，必須依情境判斷完整組、剩餘量或是否增加一個容器',
      valid: `依${constraint}解讀商與餘數的答案意義`,
      invalid: '只抄下商或餘數，不檢查情境目標',
      condition: '是否必須處理全部資源或只計算完整組',
      counterfactual: '把全部處理完改成只計算完整組'
    },
    RELATION_CHAIN: {
      forkPoint: '多個數量關係必須依事件順序連接',
      valid: '使用前一關係建立的量作為下一關係輸入',
      invalid: '把各數量獨立計算或顛倒關係順序',
      condition: '後一事件依賴前一事件結果',
      counterfactual: '移除中間事件，使題目只剩直接關係'
    },
    DUAL_CONSTRAINT_RESOLUTION: {
      forkPoint: '方案必須同時滿足兩個以上限制',
      valid: `同時檢查${constraint}與最終目標`,
      invalid: '只滿足其中一個限制就作答',
      condition: '兩項限制共同決定可行方案',
      counterfactual: '放寬其中一項限制，使可行方案改變'
    },
    CONSERVATION_OR_TRANSFER: {
      forkPoint: '總量守恆，但資源在角色或位置之間轉移',
      valid: '追蹤轉移前後各角色持有量並保持總量一致',
      invalid: '把轉移量當成新增或消失的量',
      condition: '同一批資源只改變持有者或位置',
      counterfactual: '把轉移事件改成外部新增資源'
    },
    COMPARISON_DECISION: {
      forkPoint: '算出多個結果後仍須依比較基準選擇方案',
      valid: `依${constraint}比較並說明選擇`,
      invalid: '只列計算結果，未完成選擇或比較方向相反',
      condition: '明確的大小、預算、效率或可行性基準',
      counterfactual: '改變比較基準，使最佳方案改變'
    },
    UNIT_ROLE_INTERPRETATION: {
      forkPoint: '數值相同但單位或數量角色不同',
      valid: `確認${target}的單位與角色後再作答`,
      invalid: '忽略單位流或把輸入單位當成答案單位',
      condition: '量的種類與單位轉換規則',
      counterfactual: '改變答案要求的單位或量的角色'
    },
    IRRELEVANT_INFORMATION_FILTER: {
      forkPoint: '情境同時提供必要與非必要資訊',
      valid: '只使用能連到目標角色的數量',
      invalid: '把所有看到的數字都放入關係式',
      condition: '資訊是否位於目標角色的關係圖上',
      counterfactual: '把原本非必要資訊改成必要限制'
    }
  };
  return map[act];
}

function buildMisconceptions({ proofId, act, policy }) {
  const actSpecific = policy.actSpecificMisconceptionType[act];
  return [
    {
      misconceptionId: `${proofId}_m1`,
      misconceptionType: actSpecific,
      triggerCondition: `遇到 ${act} 情境分岔時使用直覺或單一數值作答`,
      expectedWrongDecisionCandidate: `產生 ${actSpecific} 對應的錯誤答案或決策`,
      diagnosticMeaning: `學生尚未掌握 ${act} 所需的情境解讀`,
      diagnosticClassification: 'CALCULATION_PASS_INTERPRETATION_FAIL',
      severity: 'BLOCKING',
      executed: false
    },
    {
      misconceptionId: `${proofId}_m2`,
      misconceptionType: 'OPERATION_KEYWORD_MATCHING',
      triggerCondition: '依單一關鍵詞直接選運算，不建立數量角色與事件關係',
      expectedWrongDecisionCandidate: '運算選擇或理由不依情境關係',
      diagnosticMeaning: '學生使用關鍵詞配對而非語意模型',
      diagnosticClassification: 'CALCULATION_FAIL',
      severity: 'DIAGNOSTIC',
      executed: false
    },
    {
      misconceptionId: `${proofId}_m3`,
      misconceptionType: 'COMPUTED_NOT_INTERPRETED',
      triggerCondition: '完成數值計算後未回答情境中的角色、單位或決策',
      expectedWrongDecisionCandidate: '只提供中間數值或缺少理由的答案',
      diagnosticMeaning: '計算通過但答案意義未完成',
      diagnosticClassification: 'CALCULATION_PASS_INTERPRETATION_FAIL',
      severity: 'BLOCKING',
      executed: false
    }
  ];
}

function hasSurface(chain, contextIndexes) {
  if ([...contextIndexes.generatedSurfaces.values()].some((surface) => surface.atomicEpisodeId === chain.episode.nodeId)) return true;
  return (chain.episode.surfaceTemplateRefs ?? []).some((templateId) => (
    contextIndexes.generatedSurfaces.has(templateId) || contextIndexes.legacySurfaces.has(templateId)
  ));
}

function alternateContext({ candidate, contextIndexes }) {
  const chains = [...contextIndexes.episodeChains.values()]
    .filter((chain) => chain?.macro && chain?.meso && chain?.micro && chain?.episode)
    .filter((chain) => chain.macro.nodeId !== candidate.contextSelection.macroContextId)
    .filter((chain) => hasSurface(chain, contextIndexes))
    .sort((left, right) => {
      const leftPreferred = left.episode.nodeId.endsWith('constraint_decision') ? 0 : 1;
      const rightPreferred = right.episode.nodeId.endsWith('constraint_decision') ? 0 : 1;
      return leftPreferred - rightPreferred
        || left.macro.nodeId.localeCompare(right.macro.nodeId)
        || left.episode.nodeId.localeCompare(right.episode.nodeId);
    });
  return chains[0] ?? null;
}

function buildProof({ sourceRow, candidate, contextIndexes, policy }) {
  const act = inferInterpretiveAct({ sourceRow, candidate, policy });
  const details = actDetails(act, candidate);
  const suffix = safeId(candidate.patternSpecId);
  const proofId = `w02_n1proof_${suffix}`;
  const alternate = alternateContext({ candidate, contextIndexes });
  const baseCapabilityId = `w02_cap_${suffix}_n`;
  const candidateCapabilityId = `w02_cap_${suffix}_n_plus_1`;
  const target = candidate.targetRoleCandidate.mathSemanticMeaning;
  return {
    schemaVersion: 1,
    proofCandidateId: proofId,
    sourceId: candidate.sourceId,
    sourceContentIdentityGroup: candidate.sourceContentIdentityGroup,
    patternSpecId: candidate.patternSpecId,
    requestedUnknownRole: candidate.requestedUnknownRole,
    knowledgePointId: candidate.knowledgePointId,
    canonicalOperationModelId: candidate.canonicalOperationModelId,
    bindingCandidateId: candidate.bindingCandidateId,
    baseCapabilityId,
    candidateCapabilityId,
    capabilityEdge: {
      from: baseCapabilityId,
      to: candidateCapabilityId,
      shortestSemanticDistance: 1,
      intermediateSemanticNodeRequired: false
    },
    prerequisiteClosureCandidate: {
      requiredPrerequisiteCapabilityIds: [baseCapabilityId],
      availablePrerequisiteCapabilityIds: [baseCapabilityId],
      missingPrerequisiteCapabilityIds: [],
      executionVerified: false
    },
    newInterpretiveAct: act,
    pairedControlBlueprint: {
      basePromptBlueprint: `使用相同數字範圍與${candidate.answerModelCandidate.canonicalReconstruction}關係，直接求出${target}。`,
      candidatePromptBlueprint: `${candidate.promptBlueprint.textZh} 並依情境限制說明${target}代表什麼。`,
      baseTargetRole: candidate.requestedUnknownRole,
      candidateTargetRole: candidate.requestedUnknownRole,
      sameNumericPrerequisites: true,
      sameNumberDomain: true,
      semanticDeltaOnly: true,
      numericFixtureInstantiated: false
    },
    interpretationFork: {
      forkPoint: details.forkPoint,
      validInterpretationPath: details.valid,
      plausibleMisinterpretationPath: details.invalid,
      contextConditionThatResolvesFork: details.condition
    },
    interpretationWitnessBlueprint: {
      witnessType: policy.witnessTypeByAct[act],
      promptZh: `請說明答案為何必須依照「${details.condition}」判斷，而不能只寫下計算結果。`,
      expectedEvidenceCandidate: details.valid,
      targetsNewInterpretiveAct: true,
      canSeparateCalculationFromInterpretation: true,
      executed: false
    },
    misconceptionCandidates: buildMisconceptions({ proofId, act, policy }),
    counterfactualBlueprint: {
      changedContextCondition: details.counterfactual,
      numericPrerequisitesPreserved: true,
      expectedInterpretationChanged: true,
      expectedAnswerOrDecisionChanged: true,
      fixtureInstantiated: false
    },
    crossContextProofCandidate: {
      primaryMacroContextId: candidate.contextSelection.macroContextId,
      primaryAtomicEpisodeId: candidate.contextSelection.atomicEpisodeId,
      alternateMacroContextId: alternate?.macro.nodeId ?? 'gctx_macro_missing',
      alternateAtomicEpisodeId: alternate?.episode.nodeId ?? 'gctx_episode_missing',
      macroContextsDiffer: true,
      samePatternSpec: true,
      sameOperationModel: true,
      sameInterpretiveAct: true,
      sameValidatorDelta: true,
      executed: false
    },
    validatorDeltaCandidate: {
      baseValidatorChecks: candidate.validationCandidate.operationInvariants,
      candidateAdditionalValidatorChecks: [
        `validate interpretive act ${act}`,
        'validate answer role, unit and contextual meaning',
        'validate interpretation witness or decision reason',
        'classify CALCULATION_PASS_INTERPRETATION_FAIL separately'
      ]
    },
    pendingProofChecks: [
      'PAIRED_NUMERIC_FIXTURE_EXECUTION',
      'MISCONCEPTION_FIXTURE_EXECUTION',
      'COUNTERFACTUAL_FIXTURE_EXECUTION',
      'CROSS_CONTEXT_EXECUTION',
      'UNIQUE_ANSWER_AND_WITNESS_EXECUTION'
    ],
    candidateStatus: policy.nPlusOneCandidateStatus,
    productionAdmissionAllowed: false,
    lineage: {
      a02TaskId: 'POSTG-APP-W02-A02_AtomicContextBindingAndSingleApplicationCandidateMaterialization',
      a02BindingCandidateId: candidate.bindingCandidateId,
      a01dPatternSpecId: candidate.patternSpecId,
      nPlusOneNormativeSchema: 'data/curriculum/application/schema/n-plus-one-interpretation-proof.schema.json'
    }
  };
}

function pblGraphType(act, policy) {
  return policy.pblGraphRules.PBL5_BOUNDED_DECISION.includes(act)
    ? 'PBL5_BOUNDED_DECISION'
    : policy.pblGraphRules.fallback;
}

function finalProductType(macroContextId, policy) {
  return policy.finalProductByMacro[macroContextId] ?? policy.fallbackFinalProductType;
}

function buildPBLTasks({ suffix, graphType, candidate }) {
  const target = candidate.targetRoleCandidate.mathSemanticMeaning;
  const constraint = candidate.validationCandidate.contextConstraints[0] ?? '情境限制';
  if (graphType === 'PBL5_BOUNDED_DECISION') {
    return [
      { taskId:`${suffix}_t1`,sequenceIndex:1,promptZh:'整理情境中的必要資料，建立後續任務使用的基準數量。',inputRefs:[],outputMilestoneId:`${suffix}_m1`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t2`,sequenceIndex:2,promptZh:`使用基準數量計算完成${target}所需的第一項證據。`,inputRefs:[`${suffix}_m1`],outputMilestoneId:`${suffix}_m2`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t3`,sequenceIndex:3,promptZh:`使用同一基準數量檢查「${constraint}」形成的第二項限制。`,inputRefs:[`${suffix}_m1`],outputMilestoneId:`${suffix}_m3`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t4`,sequenceIndex:4,promptZh:'比較前兩項結果，建立同時符合限制的可行方案。',inputRefs:[`${suffix}_m2`,`${suffix}_m3`],outputMilestoneId:`${suffix}_m4`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t5`,sequenceIndex:5,promptZh:'綜合數量、限制與可行方案，提出最終決策並說明理由。',inputRefs:[`${suffix}_m2`,`${suffix}_m3`,`${suffix}_m4`],outputMilestoneId:`${suffix}_m5`,isFinalTask:true,fullyInstantiated:false }
    ];
  }
  return [
    { taskId:`${suffix}_t1`,sequenceIndex:1,promptZh:'整理情境資料，建立完成任務所需的主要數量。',inputRefs:[],outputMilestoneId:`${suffix}_m1`,isFinalTask:false,fullyInstantiated:false },
    { taskId:`${suffix}_t2`,sequenceIndex:2,promptZh:`使用前一結果與「${constraint}」建立可行方案的重要證據。`,inputRefs:[`${suffix}_m1`],outputMilestoneId:`${suffix}_m2`,isFinalTask:false,fullyInstantiated:false },
    { taskId:`${suffix}_t3`,sequenceIndex:3,promptZh:'綜合前兩個里程碑，提出最終方案或決策並說明理由。',inputRefs:[`${suffix}_m1`,`${suffix}_m2`],outputMilestoneId:`${suffix}_m3`,isFinalTask:true,fullyInstantiated:false }
  ];
}

function buildMilestones({ tasks, candidate }) {
  return tasks.map((task, index) => ({
    milestoneId: task.outputMilestoneId,
    producerTaskId: task.taskId,
    semanticRole: index === tasks.length - 1
      ? `最終${candidate.targetRoleCandidate.mathSemanticMeaning}方案`
      : `第${index + 1}段必要數量或限制證據`,
    requiredByTaskIds: tasks.slice(index + 1)
      .filter((later) => later.inputRefs.includes(task.outputMilestoneId))
      .map((later) => later.taskId),
    canonicalReconstructionCandidate: index === 0
      ? candidate.answerModelCandidate.canonicalReconstruction
      : `由 ${task.inputRefs.join('、') || '情境資料'} 依任務規則重建`
  }));
}

function buildPBL({ candidate, proof, contextIndexes, policy }) {
  const chain = contextIndexes.episodeChains.get(candidate.contextSelection.atomicEpisodeId);
  const graphType = pblGraphType(proof.newInterpretiveAct, policy);
  const suffix = `w02_pbl_${safeId(candidate.patternSpecId)}`;
  const productType = finalProductType(candidate.contextSelection.macroContextId, policy);
  const tasks = buildPBLTasks({ suffix, graphType, candidate });
  const milestones = buildMilestones({ tasks, candidate });
  const finalTask = tasks.at(-1);
  return {
    schemaVersion: 1,
    pblCandidateId: suffix,
    sourceId: candidate.sourceId,
    sourceContentIdentityGroup: candidate.sourceContentIdentityGroup,
    patternSpecId: candidate.patternSpecId,
    primaryKnowledgePointId: candidate.knowledgePointId,
    canonicalOperationModelId: candidate.canonicalOperationModelId,
    bindingCandidateId: candidate.bindingCandidateId,
    proofCandidateId: proof.proofCandidateId,
    macroContextId: candidate.contextSelection.macroContextId,
    atomicEpisodeId: candidate.contextSelection.atomicEpisodeId,
    drivingProblemCandidate: {
      stakeholder: chain.episode.actorRoles[0] ?? '情境參與者',
      realWorldGoal: chain.episode.eventGoal,
      problemStatementZh: `請協助${chain.episode.actorRoles[0] ?? '參與者'}在${chain.episode.eventGoal}時，運用數學資料完成可執行的${productType}。`,
      constraints: chain.episode.constraintModel,
      successCriteria: [
        `所有必要數量可由${candidate.canonicalOperationModelId}重建`,
        '最終方案使用至少兩個前段里程碑',
        '最終方案符合全部情境限制'
      ],
      consequenceOfIncorrectDecision: '資源可能不足、超出限制，或無法完成原始任務。',
      finalProductType: productType,
      authenticityExecutionVerified: false
    },
    graphType,
    taskBlueprints: tasks,
    milestoneBlueprints: milestones,
    finalProductCandidate: {
      finalProductType: productType,
      finalTaskId: finalTask.taskId,
      requiredMilestoneIds: finalTask.inputRefs,
      decisionWitnessCandidate: `最終回答必須引用${finalTask.inputRefs.join('與')}並說明如何滿足限制。`,
      constraintSatisfactionChecks: chain.episode.constraintModel,
      executed: false
    },
    primaryInterpretiveAct: proof.newInterpretiveAct,
    misconceptionCandidates: proof.misconceptionCandidates.map((row) => row.misconceptionType),
    counterfactualPropagationCandidate: {
      changedContextConstraint: proof.counterfactualBlueprint.changedContextCondition,
      affectedTaskIds: tasks.slice(1).map((row) => row.taskId),
      affectedMilestoneIds: milestones.slice(1).map((row) => row.milestoneId),
      finalDecisionMustChange: true,
      executed: false
    },
    projectionCandidate: graphType === 'PBL5_BOUNDED_DECISION'
      ? 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE'
      : 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE',
    candidateStatus: policy.pblCandidateStatus,
    productionAdmissionAllowed: false,
    lineage: {
      a02TaskId: 'POSTG-APP-W02-A02_AtomicContextBindingAndSingleApplicationCandidateMaterialization',
      a02BindingCandidateId: candidate.bindingCandidateId,
      a03ProofCandidateId: proof.proofCandidateId,
      pblNormativeSchema: 'data/curriculum/application/schema/pbl-task-set.schema.json'
    }
  };
}

export function materializeW02NPlusOneAndPBLCandidatePack({ root = process.cwd() } = {}) {
  const a02 = materializeW02AtomicContextSingleApplicationCandidatePack({ root });
  const policy = readJson(root, POLICY_PATH);
  const packIndex = readJson(root, PACK_INDEX_PATH);
  const sourceRowByPatternSpecId = new Map(a02.applicationPatternRows.map((row) => [row.patternSpec.patternSpecId, row]));
  const candidateByPatternSpecId = new Map(a02.candidates.map((row) => [row.patternSpecId, row]));
  const nPlusOneProofCandidates = a02.candidates.map((candidate) => buildProof({
    sourceRow: sourceRowByPatternSpecId.get(candidate.patternSpecId),
    candidate,
    contextIndexes: a02.contextIndexes,
    policy
  }));
  const proofByPatternSpecId = new Map(nPlusOneProofCandidates.map((row) => [row.patternSpecId, row]));
  const pblEligibleCandidates = a02.candidates.filter((candidate) => (
    candidate.classification === policy.pblEligibility.requiredClassification
  ));
  const pblTaskSetCandidates = pblEligibleCandidates.map((candidate) => buildPBL({
    candidate,
    proof: proofByPatternSpecId.get(candidate.patternSpecId),
    contextIndexes: a02.contextIndexes,
    policy
  }));
  return {
    root,
    a02,
    a02Validation: validateW02AtomicContextSingleApplicationCandidatePack(a02),
    policy,
    packIndex,
    sourceRowByPatternSpecId,
    candidateByPatternSpecId,
    proofByPatternSpecId,
    pblEligibleCandidates,
    nPlusOneProofCandidates,
    pblTaskSetCandidates
  };
}

function duplicateParity(rows, projection) {
  const byContent = new Map();
  for (const row of rows) {
    if (!byContent.has(row.sourceContentIdentityGroup)) byContent.set(row.sourceContentIdentityGroup, new Map());
    const bySource = byContent.get(row.sourceContentIdentityGroup);
    if (!bySource.has(row.sourceId)) bySource.set(row.sourceId, []);
    bySource.get(row.sourceId).push(row);
  }
  const comparisons = [];
  for (const [contentIdentityGroup, bySource] of byContent) {
    if (bySource.size < 2) continue;
    const normalized = [...bySource.entries()].map(([sourceId, sourceRows]) => ({
      sourceId,
      projections: sourceRows.map(projection).sort((left, right) => left.key.localeCompare(right.key))
    }));
    const expected = JSON.stringify(normalized[0].projections);
    comparisons.push({
      contentIdentityGroup,
      sourceIds: normalized.map((row) => row.sourceId).sort(),
      equal: normalized.every((row) => JSON.stringify(row.projections) === expected)
    });
  }
  return comparisons;
}

export function validateW02NPlusOneAndPBLCandidatePack(materialized) {
  const issues = [];
  if (!materialized.a02Validation.ok) {
    issues.push(issue('POSTG_APP_W02_A03_A02_PACK_INVALID', 'a02', { a02Issues: materialized.a02Validation.issues }));
  }
  const candidates = materialized.a02.candidates;
  const proofs = materialized.nPlusOneProofCandidates;
  const pblRows = materialized.pblTaskSetCandidates;
  if (proofs.length !== candidates.length || proofs.length !== 61) {
    issues.push(issue('POSTG_APP_W02_A03_N1_COUNT_MISMATCH', 'nPlusOneProofCandidates', { expected: candidates.length, actual: proofs.length }));
  }
  if (pblRows.length !== materialized.pblEligibleCandidates.length) {
    issues.push(issue('POSTG_APP_W02_A03_PBL_COUNT_MISMATCH', 'pblTaskSetCandidates', { expected: materialized.pblEligibleCandidates.length, actual: pblRows.length }));
  }
  if (!unique(proofs.map((row) => row.proofCandidateId)) || !unique(pblRows.map((row) => row.pblCandidateId))) {
    issues.push(issue('POSTG_APP_W02_A03_CANDIDATE_IDENTITY_DUPLICATED', 'candidatePack'));
  }

  const allowedActs = new Set(materialized.policy.interpretiveActRules.map((row) => row.act));
  for (const proof of proofs) {
    const candidate = materialized.candidateByPatternSpecId.get(proof.patternSpecId);
    if (!candidate || proof.bindingCandidateId !== candidate.bindingCandidateId
        || proof.requestedUnknownRole !== candidate.requestedUnknownRole) {
      issues.push(issue('POSTG_APP_W02_A03_N1_WITHOUT_A02_LINEAGE', proof.proofCandidateId));
      continue;
    }
    if (!allowedActs.has(proof.newInterpretiveAct)) issues.push(issue('POSTG_APP_W02_A03_INTERPRETIVE_ACT_INVALID', proof.proofCandidateId));
    if (proof.misconceptionCandidates.length !== materialized.policy.minimumMisconceptionCount) {
      issues.push(issue('POSTG_APP_W02_A03_MISCONCEPTION_COUNT_INVALID', proof.proofCandidateId));
    }
    const types = new Set(proof.misconceptionCandidates.map((row) => row.misconceptionType));
    for (const required of materialized.policy.requiredCommonMisconceptions) {
      if (!types.has(required)) issues.push(issue('POSTG_APP_W02_A03_COMMON_MISCONCEPTION_MISSING', proof.proofCandidateId, { required }));
    }
    if (!proof.misconceptionCandidates.some((row) => row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL')) {
      issues.push(issue('POSTG_APP_W02_A03_CALCULATION_PASS_INTERPRETATION_FAIL_MISSING', proof.proofCandidateId));
    }
    const cross = proof.crossContextProofCandidate;
    if (cross.primaryMacroContextId === cross.alternateMacroContextId || cross.macroContextsDiffer !== true
        || !materialized.a02.contextIndexes.episodeChains.has(cross.alternateAtomicEpisodeId)) {
      issues.push(issue('POSTG_APP_W02_A03_CROSS_CONTEXT_INVALID', proof.proofCandidateId));
    }
    if (cross.primaryAtomicEpisodeId !== candidate.contextSelection.atomicEpisodeId
        || cross.primaryMacroContextId !== candidate.contextSelection.macroContextId) {
      issues.push(issue('POSTG_APP_W02_A03_PRIMARY_CONTEXT_LINEAGE_INVALID', proof.proofCandidateId));
    }
    if (proof.capabilityEdge.shortestSemanticDistance !== 1
        || proof.capabilityEdge.intermediateSemanticNodeRequired !== false
        || proof.pairedControlBlueprint.semanticDeltaOnly !== true
        || proof.pairedControlBlueprint.numericFixtureInstantiated !== false
        || proof.interpretationWitnessBlueprint.executed !== false
        || proof.pendingProofChecks.length === 0
        || proof.candidateStatus !== materialized.policy.nPlusOneCandidateStatus
        || proof.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W02_A03_N1_BOUNDARY_INVALID', proof.proofCandidateId));
    }
  }

  for (const pbl of pblRows) {
    const candidate = materialized.candidateByPatternSpecId.get(pbl.patternSpecId);
    const proof = materialized.proofByPatternSpecId.get(pbl.patternSpecId);
    if (!candidate || !proof || candidate.classification !== materialized.policy.pblEligibility.requiredClassification) {
      issues.push(issue('POSTG_APP_W02_A03_PBL_WITHOUT_REQUIRED_LINEAGE', pbl.pblCandidateId));
      continue;
    }
    const expectedTaskCount = pbl.graphType === 'PBL5_BOUNDED_DECISION' ? 5 : 3;
    if (pbl.taskBlueprints.length !== expectedTaskCount || pbl.milestoneBlueprints.length !== expectedTaskCount) {
      issues.push(issue('POSTG_APP_W02_A03_PBL_TASK_COUNT_INVALID', pbl.pblCandidateId, { expected: expectedTaskCount }));
    }
    const milestoneIds = new Set(pbl.milestoneBlueprints.map((row) => row.milestoneId));
    for (const [index, task] of pbl.taskBlueprints.entries()) {
      if (task.sequenceIndex !== index + 1 || (index > 0 && task.inputRefs.length === 0)) {
        issues.push(issue('POSTG_APP_W02_A03_PBL_DEPENDENCY_INVALID', `${pbl.pblCandidateId}.${task.taskId}`));
      }
      for (const inputRef of task.inputRefs) {
        if (!milestoneIds.has(inputRef)) issues.push(issue('POSTG_APP_W02_A03_PBL_INPUT_MILESTONE_NOT_FOUND', `${pbl.pblCandidateId}.${task.taskId}`, { inputRef }));
      }
    }
    const finalTasks = pbl.taskBlueprints.filter((row) => row.isFinalTask);
    if (finalTasks.length !== 1 || finalTasks[0].taskId !== pbl.finalProductCandidate.finalTaskId
        || pbl.finalProductCandidate.requiredMilestoneIds.length < 2) {
      issues.push(issue('POSTG_APP_W02_A03_PBL_FINAL_SYNTHESIS_INVALID', pbl.pblCandidateId));
    }
    if (pbl.bindingCandidateId !== candidate.bindingCandidateId
        || pbl.proofCandidateId !== proof.proofCandidateId
        || pbl.atomicEpisodeId !== candidate.contextSelection.atomicEpisodeId
        || pbl.macroContextId !== candidate.contextSelection.macroContextId) {
      issues.push(issue('POSTG_APP_W02_A03_PBL_CONTEXT_LINEAGE_MISMATCH', pbl.pblCandidateId));
    }
    if (pbl.misconceptionCandidates.length < 3
        || pbl.drivingProblemCandidate.authenticityExecutionVerified !== false
        || pbl.finalProductCandidate.executed !== false
        || pbl.candidateStatus !== materialized.policy.pblCandidateStatus
        || pbl.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W02_A03_PBL_BOUNDARY_INVALID', pbl.pblCandidateId));
    }
  }

  const compatiblePblCount = pblRows.filter((row) => (
    materialized.candidateByPatternSpecId.get(row.patternSpecId)?.classification === 'APPLICATION_COMPATIBLE'
  )).length;
  if (compatiblePblCount !== 0) issues.push(issue('POSTG_APP_W02_A03_COMPATIBLE_PBL_FORCED', 'pblTaskSetCandidates'));

  const proofDuplicateComparisons = duplicateParity(proofs, (row) => ({
    key: materialized.candidateByPatternSpecId.get(row.patternSpecId)?.lineage.duplicateProjectionKey ?? row.patternSpecId,
    newInterpretiveAct: row.newInterpretiveAct,
    alternateMacroContextId: row.crossContextProofCandidate.alternateMacroContextId,
    alternateAtomicEpisodeId: row.crossContextProofCandidate.alternateAtomicEpisodeId,
    witnessType: row.interpretationWitnessBlueprint.witnessType,
    misconceptionTypes: row.misconceptionCandidates.map((entry) => entry.misconceptionType)
  }));
  const pblDuplicateComparisons = duplicateParity(pblRows, (row) => ({
    key: materialized.candidateByPatternSpecId.get(row.patternSpecId)?.lineage.duplicateProjectionKey ?? row.patternSpecId,
    graphType: row.graphType,
    macroContextId: row.macroContextId,
    atomicEpisodeId: row.atomicEpisodeId,
    finalProductType: row.finalProductCandidate.finalProductType
  }));
  if (proofDuplicateComparisons.length !== 1 || proofDuplicateComparisons.some((row) => !row.equal)) {
    issues.push(issue('POSTG_APP_W02_A03_DUPLICATE_PROOF_PROJECTION_INVALID', 'pdf_5ba57aff6a97', { proofDuplicateComparisons }));
  }
  if (pblDuplicateComparisons.some((row) => !row.equal)) {
    issues.push(issue('POSTG_APP_W02_A03_DUPLICATE_PBL_PROJECTION_INVALID', 'pdf_5ba57aff6a97', { pblDuplicateComparisons }));
  }

  const actCounts = countBy(proofs, (row) => row.newInterpretiveAct);
  const graphCounts = countBy(pblRows, (row) => row.graphType);
  const productCounts = countBy(pblRows, (row) => row.finalProductCandidate.finalProductType);
  const misconceptionCandidateCount = proofs.reduce((sum, row) => sum + row.misconceptionCandidates.length, 0);
  const productionAdmittedCount = [
    ...proofs.filter((row) => row.productionAdmissionAllowed === true),
    ...pblRows.filter((row) => row.productionAdmissionAllowed === true)
  ].length;

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      a02SingleApplicationCandidateCount: candidates.length,
      nPlusOneProofCandidateCount: proofs.length,
      misconceptionCandidateCount,
      pblEligibleCandidateCount: materialized.pblEligibleCandidates.length,
      pblTaskSetCandidateCount: pblRows.length,
      crossContextPairCount: proofs.length,
      duplicateProofProjectionGroupCount: proofDuplicateComparisons.length,
      duplicatePblProjectionGroupCount: pblDuplicateComparisons.length,
      compatiblePblCandidateCount: compatiblePblCount,
      productionAdmittedCount
    },
    actCounts,
    graphCounts,
    productCounts,
    proofDuplicateComparisons,
    pblDuplicateComparisons,
    nextShortestStep: materialized.packIndex.nextShortestStep,
    status: issues.length === 0
      ? 'W02_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK_READY'
      : 'W02_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK_BLOCKED'
  };
}

export function buildW02NPlusOneAndPBLCandidateReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW02NPlusOneAndPBLCandidatePack({ root });
  const validation = validateW02NPlusOneAndPBLCandidatePack(materialized);
  return {
    ...validation,
    programId: materialized.packIndex.programId,
    taskId: materialized.packIndex.taskId,
    samples: {
      remainder: materialized.nPlusOneProofCandidates.find((row) => row.newInterpretiveAct === 'REMAINDER_INTERPRETATION') ?? null,
      comparison: materialized.nPlusOneProofCandidates.find((row) => row.newInterpretiveAct === 'COMPARISON_DECISION') ?? null,
      pbl3: materialized.pblTaskSetCandidates.find((row) => row.graphType === 'PBL3_LINEAR') ?? null,
      pbl5: materialized.pblTaskSetCandidates.find((row) => row.graphType === 'PBL5_BOUNDED_DECISION') ?? null
    }
  };
}

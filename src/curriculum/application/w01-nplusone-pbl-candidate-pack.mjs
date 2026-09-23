import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW01AtomicContextSingleApplicationCandidatePack,
  validateW01AtomicContextSingleApplicationCandidatePack
} from './w01-atomic-context-single-application-candidate-pack.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w01-nplusone-pbl-candidate-policy.json';
const PACK_INDEX_PATH = 'data/curriculum/application/assessment/w01-nplusone-pbl-candidate-pack-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;
const normalize = (parts) => parts.flat(Infinity).filter(Boolean).join(' ').toLowerCase();
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function assessmentKey(sourceId, knowledgePointId) {
  return `${sourceId}::${knowledgePointId}`;
}

function inferInterpretiveAct({ assessmentRecord, operationModel, candidate, policy }) {
  const corpus = normalize([
    assessmentRecord.knowledgePointId,
    assessmentRecord.knowledgePointName,
    assessmentRecord.applicationModes,
    assessmentRecord.operationFamilyCandidates,
    operationModel.modelId,
    operationModel.answerType,
    operationModel.canonicalExpressions,
    operationModel.validationInvariants,
    Object.values(operationModel.operandRoles ?? {}),
    candidate.contextSelection.facetRefs,
    candidate.validationCandidate.contextConstraints
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
      forkPoint: '計算得到商與餘數後，必須判斷情境要取完整組、剩餘量或再增加一個容器',
      valid: `依${constraint}解讀商與餘數的答案意義`,
      invalid: '只抄下商或餘數，不檢查情境目標',
      condition: '是否必須處理全部資源或只計算完整組',
      counterfactual: '把「全部都要裝完」改成「只算完整裝滿的組數」'
    },
    RELATION_CHAIN: {
      forkPoint: '多個數量關係必須依事件順序連接',
      valid: '使用前一關係建立的量作為下一關係輸入',
      invalid: '把各數量獨立計算或顛倒順序',
      condition: '後一事件依賴前一事件結果',
      counterfactual: '移除中間事件，使題目只剩單一步驟'
    },
    DUAL_CONSTRAINT_RESOLUTION: {
      forkPoint: '方案必須同時滿足兩個以上限制',
      valid: `同時檢查${constraint}與最終目標`,
      invalid: '只滿足其中一個限制就作答',
      condition: '兩項限制共同決定可行方案',
      counterfactual: '放寬其中一項限制，使可行方案改變'
    },
    CONSERVATION_OR_TRANSFER: {
      forkPoint: '總量守恆，但資源在角色之間轉移',
      valid: '追蹤轉移前後各角色持有量並保持總量一致',
      invalid: '把轉移量當成新增或消失的量',
      condition: '同一批資源只改變持有者或位置',
      counterfactual: '把轉移事件改成外部新增資源'
    },
    COMPARISON_DECISION: {
      forkPoint: '算出多個結果後仍須依比較基準選擇方案',
      valid: `依${constraint}比較並說明選擇`,
      invalid: '只列出計算結果，不完成選擇或比較方向相反',
      condition: '明確的預算、大小、效率或可行性基準',
      counterfactual: '改變比較基準或預算上限，使最佳方案改變'
    },
    UNIT_ROLE_INTERPRETATION: {
      forkPoint: '數值相同但單位或數量角色不同',
      valid: `確認${target}的單位與角色後再作答`,
      invalid: '忽略單位流或把輸入單位當成答案單位',
      condition: '量的種類與單位轉換規則',
      counterfactual: '改變答案要求的單位'
    },
    IRRELEVANT_INFORMATION_FILTER: {
      forkPoint: '情境同時提供必要與非必要資訊',
      valid: '只使用能連到目標角色的數量',
      invalid: '把所有看到的數字都放入算式',
      condition: '資訊是否位於目標角色的關係圖上',
      counterfactual: '把原本非必要資訊改成必要限制'
    }
  };
  return map[act];
}

function misconceptionCandidates({ proofId, act, policy }) {
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
      expectedWrongDecisionCandidate: '運算可能正確或錯誤，但理由不依情境關係',
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

function alternateContext({ assessmentRecord, candidate, contextIndexes, preferredSuffix }) {
  const chains = assessmentRecord.eligibleAtomicEpisodeIds
    .map((episodeId) => contextIndexes.episodeChains.get(episodeId))
    .filter((chain) => chain?.macro && chain.macro.nodeId !== candidate.contextSelection.macroContextId)
    .sort((left, right) => {
      const leftPreferred = left.episode.nodeId.endsWith(preferredSuffix) ? 0 : 1;
      const rightPreferred = right.episode.nodeId.endsWith(preferredSuffix) ? 0 : 1;
      return leftPreferred - rightPreferred
        || left.macro.nodeId.localeCompare(right.macro.nodeId)
        || left.episode.nodeId.localeCompare(right.episode.nodeId);
    });
  return chains[0] ?? null;
}

function buildNPlusOneProof({ assessmentRecord, candidate, operationModel, contextIndexes, policy }) {
  const act = inferInterpretiveAct({ assessmentRecord, operationModel, candidate, policy });
  const details = actDetails(act, candidate);
  const suffix = `${safeId(candidate.sourceId)}_${safeId(candidate.knowledgePointId)}_${safeId(candidate.canonicalOperationModelId)}`;
  const proofId = `w01_n1proof_${suffix}`;
  const alternate = alternateContext({
    assessmentRecord,
    candidate,
    contextIndexes,
    preferredSuffix: 'constraint_decision'
  });
  const baseCapabilityId = `cap_${suffix}_n`;
  const candidateCapabilityId = `cap_${suffix}_n_plus_1`;
  const basePrompt = `使用相同的數字範圍與${candidate.answerModelCandidate.canonicalReconstruction}關係，直接求出${candidate.targetRoleCandidate.mathSemanticMeaning}。`;
  const candidatePrompt = `${candidate.promptBlueprint.textZh} 並依情境限制說明${candidate.targetRoleCandidate.mathSemanticMeaning}代表什麼。`;
  const misconceptionRows = misconceptionCandidates({ proofId, act, policy });
  return {
    schemaVersion: 1,
    proofCandidateId: proofId,
    sourceId: candidate.sourceId,
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
      basePromptBlueprint: basePrompt,
      candidatePromptBlueprint: candidatePrompt,
      baseTargetRole: candidate.targetRoleCandidate.mathRoleId,
      candidateTargetRole: candidate.targetRoleCandidate.mathRoleId,
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
      promptZh: `請說明為什麼答案必須依照「${details.condition}」判斷，而不能只寫下計算結果。`,
      expectedEvidenceCandidate: details.valid,
      targetsNewInterpretiveAct: true,
      canSeparateCalculationFromInterpretation: true,
      executed: false
    },
    misconceptionCandidates: misconceptionRows,
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
      sameKnowledgePoint: true,
      sameOperationModel: true,
      sameInterpretiveAct: true,
      sameValidatorDelta: true,
      executed: false
    },
    validatorDeltaCandidate: {
      baseValidatorChecks: candidate.validationCandidate.operationInvariants,
      candidateAdditionalValidatorChecks: [
        `validate interpretive act ${act}`,
        'validate answer role and answer meaning',
        'validate context decision or interpretation statement',
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
      a00AssessmentTaskId: 'POSTG-APP-W01-A00_Golden15ApplicationCapabilityAssessmentAndAdmissionBaseline',
      a01BindingCandidateId: candidate.bindingCandidateId,
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
      { taskId:`${suffix}_t1`,sequenceIndex:1,promptZh:'整理情境中的必要資料，建立可供後續使用的基準數量。',inputRefs:[],outputMilestoneId:`${suffix}_m1`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t2`,sequenceIndex:2,promptZh:`使用基準數量計算完成${target}所需的第一項資源。`,inputRefs:[`${suffix}_m1`],outputMilestoneId:`${suffix}_m2`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t3`,sequenceIndex:3,promptZh:`使用同一基準數量檢查「${constraint}」形成的第二項限制。`,inputRefs:[`${suffix}_m1`],outputMilestoneId:`${suffix}_m3`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t4`,sequenceIndex:4,promptZh:'比較前兩項結果，建立符合全部限制的可行方案。',inputRefs:[`${suffix}_m2`,`${suffix}_m3`],outputMilestoneId:`${suffix}_m4`,isFinalTask:false,fullyInstantiated:false },
      { taskId:`${suffix}_t5`,sequenceIndex:5,promptZh:'綜合必要數量、限制檢查與可行方案，提出最終決策並說明理由。',inputRefs:[`${suffix}_m2`,`${suffix}_m3`,`${suffix}_m4`],outputMilestoneId:`${suffix}_m5`,isFinalTask:true,fullyInstantiated:false }
    ];
  }
  return [
    { taskId:`${suffix}_t1`,sequenceIndex:1,promptZh:'先整理情境資料，建立完成任務所需的主要數量。',inputRefs:[],outputMilestoneId:`${suffix}_m1`,isFinalTask:false,fullyInstantiated:false },
    { taskId:`${suffix}_t2`,sequenceIndex:2,promptZh:`使用前一結果與「${constraint}」計算可行方案的重要數量。`,inputRefs:[`${suffix}_m1`],outputMilestoneId:`${suffix}_m2`,isFinalTask:false,fullyInstantiated:false },
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

function buildPBL({ assessmentRecord, candidate, proof, contextIndexes, policy }) {
  const chain = contextIndexes.episodeChains.get(candidate.contextSelection.atomicEpisodeId);
  const graphType = pblGraphType(proof.newInterpretiveAct, policy);
  const suffix = `w01_pbl_${safeId(candidate.sourceId)}_${safeId(candidate.knowledgePointId)}_${safeId(candidate.canonicalOperationModelId)}`;
  const productType = finalProductType(candidate.contextSelection.macroContextId, policy);
  const tasks = buildPBLTasks({ suffix, graphType, candidate });
  const milestones = buildMilestones({ tasks, candidate });
  const finalTask = tasks.at(-1);
  const finalRequiredMilestones = finalTask.inputRefs.slice(-Math.max(2, finalTask.inputRefs.length));
  return {
    schemaVersion: 1,
    pblCandidateId: suffix,
    sourceId: candidate.sourceId,
    primaryKnowledgePointId: candidate.knowledgePointId,
    canonicalOperationModelId: candidate.canonicalOperationModelId,
    bindingCandidateId: candidate.bindingCandidateId,
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
      requiredMilestoneIds: finalRequiredMilestones,
      decisionWitnessCandidate: `最終回答必須引用${finalRequiredMilestones.join('與')}並說明如何滿足限制。`,
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
      a00AssessmentTaskId: 'POSTG-APP-W01-A00_Golden15ApplicationCapabilityAssessmentAndAdmissionBaseline',
      a01BindingCandidateId: candidate.bindingCandidateId,
      pblNormativeSchema: 'data/curriculum/application/schema/pbl-task-set.schema.json'
    }
  };
}

export function materializeW01NPlusOneAndPBLCandidatePack({ root = process.cwd() } = {}) {
  const a01 = materializeW01AtomicContextSingleApplicationCandidatePack({ root });
  const policy = readJson(root, POLICY_PATH);
  const packIndex = readJson(root, PACK_INDEX_PATH);
  const assessmentByKey = new Map(a01.assessment.records.map((row) => [assessmentKey(row.sourceId, row.knowledgePointId), row]));
  const candidateByKey = new Map(a01.candidates.map((row) => [assessmentKey(row.sourceId, row.knowledgePointId), row]));
  const nPlusOneProofCandidates = [];
  const nPlusOneByKey = new Map();
  for (const assessmentRecord of a01.assessment.records.filter((row) => row.applicationModes.includes('SINGLE_N_PLUS_1'))) {
    const key = assessmentKey(assessmentRecord.sourceId, assessmentRecord.knowledgePointId);
    const candidate = candidateByKey.get(key);
    const operationModel = a01.operationIndexes.operationModels.get(`${key}::${candidate?.canonicalOperationModelId}`);
    if (!candidate || !operationModel) continue;
    const proof = buildNPlusOneProof({
      assessmentRecord,
      candidate,
      operationModel,
      contextIndexes: a01.contextIndexes,
      policy
    });
    nPlusOneProofCandidates.push(proof);
    nPlusOneByKey.set(key, proof);
  }
  const pblTaskSetCandidates = [];
  for (const assessmentRecord of a01.assessment.records.filter((row) => row.applicationModes.includes('PBL_TASK_SET'))) {
    const key = assessmentKey(assessmentRecord.sourceId, assessmentRecord.knowledgePointId);
    const candidate = candidateByKey.get(key);
    const proof = nPlusOneByKey.get(key);
    if (!candidate || !proof) continue;
    pblTaskSetCandidates.push(buildPBL({
      assessmentRecord,
      candidate,
      proof,
      contextIndexes: a01.contextIndexes,
      policy
    }));
  }
  return {
    a01,
    policy,
    packIndex,
    assessmentByKey,
    candidateByKey,
    nPlusOneProofCandidates,
    pblTaskSetCandidates
  };
}

export function validateW01NPlusOneAndPBLCandidatePack(materialized) {
  const issues = [];
  const a01Validation = validateW01AtomicContextSingleApplicationCandidatePack(materialized.a01);
  if (!a01Validation.ok) {
    issues.push(issue('POSTG_APP_W01_A02_A01_PACK_INVALID', 'a01', { a01Issues: a01Validation.issues }));
  }
  const expectedN1 = materialized.a01.assessment.records.filter((row) => row.applicationModes.includes('SINGLE_N_PLUS_1'));
  const expectedPBL = materialized.a01.assessment.records.filter((row) => row.applicationModes.includes('PBL_TASK_SET'));
  const proofs = materialized.nPlusOneProofCandidates;
  const pblRows = materialized.pblTaskSetCandidates;
  if (proofs.length !== expectedN1.length) {
    issues.push(issue('POSTG_APP_W01_A02_N1_COUNT_MISMATCH', 'nPlusOneProofCandidates', { expected: expectedN1.length, actual: proofs.length }));
  }
  if (pblRows.length !== expectedPBL.length) {
    issues.push(issue('POSTG_APP_W01_A02_PBL_COUNT_MISMATCH', 'pblTaskSetCandidates', { expected: expectedPBL.length, actual: pblRows.length }));
  }
  if (!unique(proofs.map((row) => row.proofCandidateId))) issues.push(issue('POSTG_APP_W01_A02_N1_ID_DUPLICATED', 'nPlusOneProofCandidates'));
  if (!unique(pblRows.map((row) => row.pblCandidateId))) issues.push(issue('POSTG_APP_W01_A02_PBL_ID_DUPLICATED', 'pblTaskSetCandidates'));

  const allowedActs = new Set(materialized.policy.interpretiveActRules.map((row) => row.act));
  for (const proof of proofs) {
    const assessmentRecord = materialized.assessmentByKey.get(assessmentKey(proof.sourceId, proof.knowledgePointId));
    const a01Candidate = materialized.candidateByKey.get(assessmentKey(proof.sourceId, proof.knowledgePointId));
    if (!assessmentRecord?.applicationModes.includes('SINGLE_N_PLUS_1') || !a01Candidate) {
      issues.push(issue('POSTG_APP_W01_A02_N1_WITHOUT_A00_A01_LINEAGE', proof.proofCandidateId));
      continue;
    }
    if (!allowedActs.has(proof.newInterpretiveAct)) {
      issues.push(issue('POSTG_APP_W01_A02_INTERPRETIVE_ACT_INVALID', proof.proofCandidateId));
    }
    if (proof.misconceptionCandidates.length < materialized.policy.minimumMisconceptionCount) {
      issues.push(issue('POSTG_APP_W01_A02_MISCONCEPTION_COUNT_INSUFFICIENT', proof.proofCandidateId));
    }
    if (!proof.misconceptionCandidates.some((row) => row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL')) {
      issues.push(issue('POSTG_APP_W01_A02_CALCULATION_PASS_INTERPRETATION_FAIL_MISSING', proof.proofCandidateId));
    }
    const cross = proof.crossContextProofCandidate;
    if (cross.primaryMacroContextId === cross.alternateMacroContextId
        || cross.macroContextsDiffer !== true) {
      issues.push(issue('POSTG_APP_W01_A02_CROSS_CONTEXT_MACRO_NOT_DIFFERENT', proof.proofCandidateId));
    }
    if (!assessmentRecord.eligibleAtomicEpisodeIds.includes(cross.primaryAtomicEpisodeId)
        || !assessmentRecord.eligibleAtomicEpisodeIds.includes(cross.alternateAtomicEpisodeId)) {
      issues.push(issue('POSTG_APP_W01_A02_CROSS_CONTEXT_EPISODE_NOT_ELIGIBLE', proof.proofCandidateId));
    }
    if (proof.candidateStatus !== 'N_PLUS_1_PROOF_BLUEPRINT_COMPLETE'
        || proof.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W01_A02_N1_PRODUCTION_ADMISSION_FORBIDDEN', proof.proofCandidateId));
    }
    if (proof.pendingProofChecks.length === 0) {
      issues.push(issue('POSTG_APP_W01_A02_PENDING_PROOF_CHECKS_MISSING', proof.proofCandidateId));
    }
  }

  const proofByKey = new Map(proofs.map((row) => [assessmentKey(row.sourceId, row.knowledgePointId), row]));
  for (const pbl of pblRows) {
    const key = assessmentKey(pbl.sourceId, pbl.primaryKnowledgePointId);
    const assessmentRecord = materialized.assessmentByKey.get(key);
    const a01Candidate = materialized.candidateByKey.get(key);
    const proof = proofByKey.get(key);
    if (!assessmentRecord?.applicationModes.includes('PBL_TASK_SET') || !a01Candidate || !proof) {
      issues.push(issue('POSTG_APP_W01_A02_PBL_WITHOUT_LINEAGE', pbl.pblCandidateId));
      continue;
    }
    const expectedTaskCount = pbl.graphType === 'PBL5_BOUNDED_DECISION' ? 5 : 3;
    if (pbl.taskBlueprints.length !== expectedTaskCount) {
      issues.push(issue('POSTG_APP_W01_A02_PBL_TASK_COUNT_INVALID', pbl.pblCandidateId, { expected: expectedTaskCount, actual: pbl.taskBlueprints.length }));
    }
    const taskIds = new Set(pbl.taskBlueprints.map((row) => row.taskId));
    const milestoneIds = new Set(pbl.milestoneBlueprints.map((row) => row.milestoneId));
    for (const [index, task] of pbl.taskBlueprints.entries()) {
      if (task.sequenceIndex !== index + 1) issues.push(issue('POSTG_APP_W01_A02_PBL_SEQUENCE_INVALID', pbl.pblCandidateId));
      if (index > 0 && task.inputRefs.length === 0) issues.push(issue('POSTG_APP_W01_A02_PBL_DEPENDENCY_MISSING', `${pbl.pblCandidateId}.${task.taskId}`));
      for (const inputRef of task.inputRefs) {
        if (!milestoneIds.has(inputRef)) issues.push(issue('POSTG_APP_W01_A02_PBL_INPUT_MILESTONE_NOT_FOUND', `${pbl.pblCandidateId}.${task.taskId}`, { inputRef }));
      }
    }
    const finalTasks = pbl.taskBlueprints.filter((row) => row.isFinalTask);
    if (finalTasks.length !== 1 || !taskIds.has(pbl.finalProductCandidate.finalTaskId)) {
      issues.push(issue('POSTG_APP_W01_A02_PBL_FINAL_TASK_INVALID', pbl.pblCandidateId));
    }
    if (pbl.finalProductCandidate.requiredMilestoneIds.length < 2) {
      issues.push(issue('POSTG_APP_W01_A02_PBL_FINAL_SYNTHESIS_INSUFFICIENT', pbl.pblCandidateId));
    }
    if (pbl.misconceptionCandidates.length < 3) {
      issues.push(issue('POSTG_APP_W01_A02_PBL_MISCONCEPTION_COUNT_INSUFFICIENT', pbl.pblCandidateId));
    }
    if (pbl.atomicEpisodeId !== a01Candidate.contextSelection.atomicEpisodeId
        || pbl.macroContextId !== a01Candidate.contextSelection.macroContextId) {
      issues.push(issue('POSTG_APP_W01_A02_PBL_CONTEXT_LINEAGE_MISMATCH', pbl.pblCandidateId));
    }
    if (pbl.candidateStatus !== 'PBL_TASK_SET_BLUEPRINT_COMPLETE'
        || pbl.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W01_A02_PBL_PRODUCTION_ADMISSION_FORBIDDEN', pbl.pblCandidateId));
    }
  }

  const actCounts = proofs.reduce((counts, row) => {
    counts[row.newInterpretiveAct] = (counts[row.newInterpretiveAct] ?? 0) + 1;
    return counts;
  }, {});
  const graphCounts = pblRows.reduce((counts, row) => {
    counts[row.graphType] = (counts[row.graphType] ?? 0) + 1;
    return counts;
  }, {});
  const productCounts = pblRows.reduce((counts, row) => {
    const type = row.finalProductCandidate.finalProductType;
    counts[type] = (counts[type] ?? 0) + 1;
    return counts;
  }, {});
  return {
    ok: issues.length === 0,
    issues,
    counts: {
      expectedNPlusOneCount: expectedN1.length,
      nPlusOneProofCandidateCount: proofs.length,
      expectedPBLCount: expectedPBL.length,
      pblTaskSetCandidateCount: pblRows.length,
      crossContextPairCount: proofs.length,
      productionAdmittedCount: [
        ...proofs.filter((row) => row.productionAdmissionAllowed === true),
        ...pblRows.filter((row) => row.productionAdmissionAllowed === true)
      ].length
    },
    actCounts,
    graphCounts,
    productCounts,
    nextShortestStep: materialized.packIndex.nextShortestStep,
    status: issues.length === 0
      ? 'W01_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK_READY'
      : 'W01_N_PLUS_ONE_AND_PBL_CANDIDATE_PACK_BLOCKED'
  };
}

export function buildW01NPlusOneAndPBLCandidateReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW01NPlusOneAndPBLCandidatePack({ root });
  const validation = validateW01NPlusOneAndPBLCandidatePack(materialized);
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

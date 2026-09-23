const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const unique = (values) => new Set(values).size === values.length;
const issue = (code, path, details = {}) => ({ code, path, ...details });

function requireFields(value, fields, path, issues) {
  if (!isObject(value)) {
    issues.push(issue('APP_SCHEMA_OBJECT_REQUIRED', path));
    return;
  }
  for (const field of fields) {
    if (!(field in value)) issues.push(issue('APP_SCHEMA_FIELD_MISSING', `${path}.${field}`));
  }
}

function indexUnitAuthority(unitRegistry) {
  const knowledgePoints = new Map();
  const operationModels = new Map();
  for (const kp of unitRegistry?.knowledgePoints ?? []) {
    knowledgePoints.set(kp.knowledgePointId, kp);
    for (const model of kp.operationModels ?? []) {
      operationModels.set(model.modelId, { ...model, knowledgePointId: kp.knowledgePointId });
    }
  }
  return { knowledgePoints, operationModels };
}

function indexContextAuthority(contextRegistry) {
  const families = new Map();
  const templates = new Map();
  for (const family of contextRegistry?.contextFamilies ?? []) {
    families.set(family.contextFamilyId, family);
    for (const template of family.surfaceTemplates ?? []) {
      templates.set(template.templateId, { ...template, contextFamilyId: family.contextFamilyId });
    }
  }
  return { families, templates };
}

export function buildApplicationAuthority({ unitRegistry, contextRegistry, bindings = [], proofs = [], pblTaskSets = [] }) {
  return {
    unitRegistry,
    contextRegistry,
    ...indexUnitAuthority(unitRegistry),
    ...indexContextAuthority(contextRegistry),
    bindings: new Map(bindings.map((row) => [row.bindingId, row])),
    proofs: new Map(proofs.map((row) => [row.proofId, row])),
    pblTaskSets: new Map(pblTaskSets.map((row) => [row.pblTaskSetId, row]))
  };
}

function numericRoleValue(item, roleId) {
  return item?.givenRoles?.find((row) => row.roleId === roleId)?.value;
}

function validateKnownPilotArithmetic(item, issues, path) {
  const answer = item?.answerModel?.numericAnswer;
  const modelId = item?.canonicalOperationModelId;

  if (modelId === 'op_g3b_u01_quotative_division') {
    const total = numericRoleValue(item, 'totalAmount');
    const amountPerGroup = numericRoleValue(item, 'amountPerGroup');
    if (!Number.isInteger(total) || !Number.isInteger(amountPerGroup) || amountPerGroup <= 0) {
      issues.push(issue('APP_NUMERIC_INPUT_INVALID', path));
    } else if (total % amountPerGroup !== 0 || answer !== total / amountPerGroup) {
      issues.push(issue('APP_NUMERIC_ANSWER_INVALID', path, { expected: total / amountPerGroup, actual: answer }));
    }
  }

  if (modelId === 'op_g3b_u01_remainder_floor_ceil_decision') {
    const total = numericRoleValue(item, 'total');
    const capacity = numericRoleValue(item, 'capacity');
    const targetRole = item?.targetRole?.roleId;
    if (!Number.isInteger(total) || !Number.isInteger(capacity) || capacity <= 0) {
      issues.push(issue('APP_NUMERIC_INPUT_INVALID', path));
    } else {
      const expected = targetRole === 'maxCompleteGroups'
        ? Math.floor(total / capacity)
        : targetRole === 'minimumResourceCount'
          ? Math.ceil(total / capacity)
          : null;
      if (expected === null) {
        issues.push(issue('APP_TARGET_ROLE_UNSUPPORTED', `${path}.targetRole.roleId`, { actual: targetRole }));
      } else if (answer !== expected) {
        issues.push(issue('APP_NUMERIC_ANSWER_INVALID', path, { expected, actual: answer }));
      }
    }
  }
}

export function validateSingleApplicationItem(item, authority, path = 'singleItem') {
  const issues = [];
  requireFields(item, [
    'itemId',
    'applicationMode',
    'sourceId',
    'knowledgePointId',
    'canonicalOperationModelId',
    'primaryTargetCount',
    'givenRoles',
    'targetRole',
    'relationGraph',
    'globalContextFamilyId',
    'unitContextBindingId',
    'surfaceTemplateId',
    'applicationCapabilityLevel',
    'answerModel',
    'validationContract',
    'lineage'
  ], path, issues);

  if (item?.primaryTargetCount !== 1) issues.push(issue('APP_SINGLE_PRIMARY_TARGET_COUNT_INVALID', `${path}.primaryTargetCount`));
  if (!['SINGLE_DIRECT', 'SINGLE_N_PLUS_1'].includes(item?.applicationMode)) {
    issues.push(issue('APP_SINGLE_MODE_INVALID', `${path}.applicationMode`));
  }
  for (const forbidden of ['dependencyGraph', 'milestones', 'finalProduct']) {
    if (forbidden in (item ?? {})) issues.push(issue('APP_SINGLE_PBL_FIELD_FORBIDDEN', `${path}.${forbidden}`));
  }

  const kp = authority?.knowledgePoints?.get(item?.knowledgePointId);
  const operation = authority?.operationModels?.get(item?.canonicalOperationModelId);
  if (!kp) issues.push(issue('APP_KNOWLEDGE_POINT_NOT_FOUND', `${path}.knowledgePointId`));
  if (!operation) issues.push(issue('APP_OPERATION_MODEL_NOT_FOUND', `${path}.canonicalOperationModelId`));
  if (operation && operation.knowledgePointId !== item?.knowledgePointId) {
    issues.push(issue('APP_OPERATION_KNOWLEDGE_POINT_LINEAGE_MISMATCH', path));
  }
  if (item?.sourceId !== authority?.unitRegistry?.sourceId) issues.push(issue('APP_SOURCE_LINEAGE_MISMATCH', `${path}.sourceId`));

  const binding = authority?.bindings?.get(item?.unitContextBindingId);
  if (!binding) {
    issues.push(issue('APP_CONTEXT_BINDING_NOT_FOUND', `${path}.unitContextBindingId`));
  } else {
    if (!binding.applicationModes?.includes(item.applicationMode)) issues.push(issue('APP_CONTEXT_BINDING_MODE_NOT_ALLOWED', path));
    if (binding.contextFamilyId !== item.globalContextFamilyId) issues.push(issue('APP_CONTEXT_FAMILY_BINDING_MISMATCH', path));
    if (!binding.admittedSurfaceTemplateIds?.includes(item.surfaceTemplateId)) issues.push(issue('APP_SURFACE_TEMPLATE_NOT_ADMITTED', path));
  }

  const family = authority?.families?.get(item?.globalContextFamilyId);
  const template = authority?.templates?.get(item?.surfaceTemplateId);
  if (!family) issues.push(issue('APP_CONTEXT_FAMILY_NOT_FOUND', `${path}.globalContextFamilyId`));
  if (!template || template.contextFamilyId !== item?.globalContextFamilyId) {
    issues.push(issue('APP_CONTEXT_TEMPLATE_NOT_FOUND', `${path}.surfaceTemplateId`));
  }

  if (!isObject(item?.answerModel) || !item.answerModel.answerRole || !(item.answerModel.answerUnits?.length > 0)) {
    issues.push(issue('APP_ANSWER_MEANING_INCOMPLETE', `${path}.answerModel`));
  } else {
    if (item.answerModel.answerRole !== item?.targetRole?.roleId) issues.push(issue('APP_ANSWER_ROLE_MISMATCH', path));
    if (!item.answerModel.answerUnits.includes(item?.targetRole?.answerUnit)) issues.push(issue('APP_ANSWER_UNIT_MISMATCH', path));
  }

  if (item?.applicationMode === 'SINGLE_DIRECT') {
    if (item.applicationCapabilityLevel !== 'N') issues.push(issue('APP_DIRECT_CAPABILITY_LEVEL_INVALID', path));
    if ('nPlusOneEvidence' in item) issues.push(issue('APP_DIRECT_N_PLUS_ONE_EVIDENCE_FORBIDDEN', path));
  }
  if (item?.applicationMode === 'SINGLE_N_PLUS_1') {
    if (item.applicationCapabilityLevel !== 'N_PLUS_1') issues.push(issue('APP_N_PLUS_ONE_CAPABILITY_LEVEL_INVALID', path));
    if (!item.interpretationWitness) issues.push(issue('APP_N_PLUS_ONE_WITNESS_MISSING', path));
    if (!item.nPlusOneEvidence) issues.push(issue('APP_N_PLUS_ONE_EVIDENCE_MISSING', path));
    if ((item.nPlusOneEvidence?.misconceptionModels?.length ?? 0) < 2) issues.push(issue('APP_N_PLUS_ONE_MISCONCEPTION_COVERAGE_INSUFFICIENT', path));
    if (item.nPlusOneEvidence?.intermediateSemanticNodeRequired !== false) issues.push(issue('APP_N_PLUS_ONE_NOT_ADJACENT', path));
    if (!binding?.nPlusOneProofRef || !authority?.proofs?.has(binding.nPlusOneProofRef)) {
      issues.push(issue('APP_N_PLUS_ONE_PROOF_NOT_ADMITTED', path));
    }
  }

  validateKnownPilotArithmetic(item, issues, path);
  return { ok: issues.length === 0, issues };
}

export function validateNPlusOneProof(proof, path = 'nPlusOneProof') {
  const issues = [];
  requireFields(proof, [
    'proofId',
    'baseCapabilityId',
    'candidateCapabilityId',
    'capabilityEdge',
    'prerequisiteClosure',
    'newInterpretiveAct',
    'pairedControl',
    'interpretationFork',
    'interpretationWitness',
    'misconceptionModels',
    'counterfactualEvidence',
    'crossContextEvidence',
    'keywordRobustnessEvidence',
    'validatorDelta',
    'answerMeaningValidation',
    'verdict'
  ], path, issues);

  if (proof?.capabilityEdge?.shortestSemanticDistance !== 1) issues.push(issue('APP_N_PLUS_ONE_DISTANCE_NOT_ONE', path));
  if (proof?.capabilityEdge?.intermediateSemanticNodeRequired !== false) issues.push(issue('APP_N_PLUS_ONE_INTERMEDIATE_NODE_REQUIRED', path));
  if ((proof?.prerequisiteClosure?.missingPrerequisiteCapabilityIds?.length ?? 1) !== 0) {
    issues.push(issue('APP_N_PLUS_ONE_PREREQUISITE_CLOSURE_FAILED', path));
  }
  for (const flag of ['sameNumericPrerequisites', 'sameOrEquivalentNumbers', 'sameNumberDomain', 'sameOrEquivalentSurfaceLoad', 'semanticDeltaOnly']) {
    if (proof?.pairedControl?.[flag] !== true) issues.push(issue('APP_N_PLUS_ONE_PAIRED_CONTROL_FAILED', `${path}.pairedControl.${flag}`));
  }
  if (!proof?.interpretationFork?.contextConditionThatResolvesFork) issues.push(issue('APP_N_PLUS_ONE_INTERPRETATION_FORK_MISSING', path));
  if (proof?.interpretationWitness?.witnessTargetsNewInterpretiveAct !== true
      || proof?.interpretationWitness?.witnessCanDistinguishCorrectArithmeticFromCorrectInterpretation !== true
      || proof?.interpretationWitness?.witnessDoesNotRevealAnswer !== true) {
    issues.push(issue('APP_N_PLUS_ONE_WITNESS_INVALID', path));
  }
  if ((proof?.misconceptionModels?.length ?? 0) < 2) issues.push(issue('APP_N_PLUS_ONE_MISCONCEPTION_COVERAGE_INSUFFICIENT', path));
  if (!proof?.misconceptionModels?.some((row) => row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL')) {
    issues.push(issue('APP_N_PLUS_ONE_DIAGNOSTIC_MODEL_MISSING', path));
  }
  if (proof?.counterfactualEvidence?.numericPrerequisitesPreserved !== true
      || proof?.counterfactualEvidence?.expectedInterpretationChanged !== true
      || proof?.counterfactualEvidence?.expectedAnswerOrDecisionChanged !== true) {
    issues.push(issue('APP_N_PLUS_ONE_COUNTERFACTUAL_FAILED', path));
  }
  if (proof?.crossContextEvidence?.sharedRoleGraph !== true
      || proof?.crossContextEvidence?.sharedNewInterpretiveAct !== true
      || proof?.crossContextEvidence?.sameValidatorDelta !== true) {
    issues.push(issue('APP_N_PLUS_ONE_CROSS_CONTEXT_INVARIANCE_FAILED', path));
  }
  if (proof?.keywordRobustnessEvidence?.roleGraphEquivalent !== true
      || proof?.keywordRobustnessEvidence?.expectedAnswerEquivalent !== true) {
    issues.push(issue('APP_N_PLUS_ONE_KEYWORD_ROBUSTNESS_FAILED', path));
  }
  if (!(proof?.validatorDelta?.candidateAdditionalValidatorChecks?.length > 0)) {
    issues.push(issue('APP_N_PLUS_ONE_VALIDATOR_DELTA_MISSING', path));
  }
  if (proof?.verdict !== 'PROVEN_N_PLUS_1_CANDIDATE') issues.push(issue('APP_N_PLUS_ONE_PROOF_VERDICT_NOT_PROVEN', path));
  return { ok: issues.length === 0, issues };
}

export function validateApplicationContextBinding(binding, authority, path = 'contextBinding') {
  const issues = [];
  requireFields(binding, [
    'bindingId',
    'sourceId',
    'knowledgePointId',
    'canonicalOperationModelId',
    'applicationModes',
    'contextFamilyId',
    'requiredContextAffordances',
    'providedContextAffordances',
    'roleBindings',
    'unitFlow',
    'semanticConstraints',
    'forbiddenCombinations',
    'admittedSurfaceTemplateIds',
    'answerWitnessContract',
    'admissionStatus',
    'lineage'
  ], path, issues);

  const kp = authority?.knowledgePoints?.get(binding?.knowledgePointId);
  const operation = authority?.operationModels?.get(binding?.canonicalOperationModelId);
  if (!kp) issues.push(issue('APP_KNOWLEDGE_POINT_NOT_FOUND', `${path}.knowledgePointId`));
  if (!operation) issues.push(issue('APP_OPERATION_MODEL_NOT_FOUND', `${path}.canonicalOperationModelId`));
  if (operation && operation.knowledgePointId !== binding?.knowledgePointId) issues.push(issue('APP_OPERATION_KNOWLEDGE_POINT_LINEAGE_MISMATCH', path));
  if (binding?.sourceId !== authority?.unitRegistry?.sourceId) issues.push(issue('APP_SOURCE_LINEAGE_MISMATCH', `${path}.sourceId`));

  const family = authority?.families?.get(binding?.contextFamilyId);
  if (!family) issues.push(issue('APP_CONTEXT_FAMILY_NOT_FOUND', `${path}.contextFamilyId`));
  const required = new Set(binding?.requiredContextAffordances ?? []);
  const provided = new Set(binding?.providedContextAffordances ?? []);
  for (const affordance of required) {
    if (!provided.has(affordance)) issues.push(issue('APP_CONTEXT_AFFORDANCE_MISSING', path, { affordance }));
  }

  const roleIds = binding?.roleBindings?.map((row) => row.mathRoleId) ?? [];
  if (!unique(roleIds)) issues.push(issue('APP_CONTEXT_ROLE_BINDING_DUPLICATED', path));
  const answerRoles = binding?.roleBindings?.filter((row) => row.isAnswerRole) ?? [];
  if (answerRoles.length !== 1) issues.push(issue('APP_CONTEXT_ANSWER_ROLE_COUNT_INVALID', path, { count: answerRoles.length }));
  const allowedMathRoles = new Set([
    ...Object.keys(operation?.operandRoles ?? {}),
    ...(operation?.unknownRoles ?? [])
  ]);
  for (const roleId of roleIds) {
    if (!allowedMathRoles.has(roleId)) issues.push(issue('APP_CONTEXT_ROLE_NOT_IN_OPERATION_MODEL', path, { roleId }));
  }
  if (binding?.unitFlow?.validated !== true) issues.push(issue('APP_CONTEXT_UNIT_FLOW_INVALID', path));
  if (answerRoles[0] && binding?.unitFlow?.answerUnit !== answerRoles[0].unit) issues.push(issue('APP_CONTEXT_ANSWER_UNIT_FLOW_MISMATCH', path));
  if ((binding?.semanticConstraints?.length ?? 0) < 1) issues.push(issue('APP_CONTEXT_SEMANTIC_CONSTRAINT_MISSING', path));
  if (binding?.forbiddenCombinations?.some((row) => row.matched === true)) issues.push(issue('APP_CONTEXT_FORBIDDEN_COMBINATION_MATCHED', path));

  for (const templateId of binding?.admittedSurfaceTemplateIds ?? []) {
    const template = authority?.templates?.get(templateId);
    if (!template || template.contextFamilyId !== binding.contextFamilyId) issues.push(issue('APP_CONTEXT_TEMPLATE_NOT_IN_FAMILY', path, { templateId }));
  }
  if ((binding?.admittedSurfaceTemplateIds?.length ?? 0) < 1) issues.push(issue('APP_CONTEXT_NO_SURFACE_TEMPLATE_ADMITTED', path));

  if (binding?.applicationModes?.includes('SINGLE_N_PLUS_1')) {
    if (!binding.nPlusOneProofRef || !authority?.proofs?.has(binding.nPlusOneProofRef)) issues.push(issue('APP_CONTEXT_N_PLUS_ONE_PROOF_MISSING', path));
  }
  if (binding?.applicationModes?.includes('PBL_TASK_SET')) {
    if (!binding.pblContractRef || !authority?.pblTaskSets?.has(binding.pblContractRef)) issues.push(issue('APP_CONTEXT_PBL_CONTRACT_MISSING', path));
    if (!(binding.allowedPBLGraphTypes?.length > 0)) issues.push(issue('APP_CONTEXT_PBL_GRAPH_TYPE_MISSING', path));
    if (!(binding.allowedPBLFinalProductTypes?.length > 0)) issues.push(issue('APP_CONTEXT_PBL_FINAL_PRODUCT_TYPE_MISSING', path));
  }
  if (binding?.admissionStatus === 'PRODUCTION_ADMITTED') issues.push(issue('APP_A05_PRODUCTION_BINDING_FORBIDDEN', path));
  return { ok: issues.length === 0, issues };
}

function hasTaskCycle(tasks, milestones) {
  const taskById = new Map(tasks.map((row) => [row.taskId, row]));
  const producerByMilestone = new Map(milestones.map((row) => [row.milestoneId, row.producerTaskId]));
  const edges = new Map(tasks.map((row) => [row.taskId, []]));
  for (const task of tasks) {
    for (const ref of task.inputRefs ?? []) {
      const producer = producerByMilestone.get(ref);
      if (producer && taskById.has(producer)) edges.get(producer).push(task.taskId);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of edges.get(id) ?? []) if (visit(next)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return [...taskById.keys()].some(visit);
}

export function validatePblTaskSet(taskSet, authority, path = 'pblTaskSet') {
  const issues = [];
  requireFields(taskSet, [
    'pblTaskSetId',
    'sourceId',
    'primaryKnowledgePointId',
    'canonicalOperationModelIds',
    'globalContextFamilyId',
    'unitContextBindingId',
    'drivingProblem',
    'graphType',
    'tasks',
    'milestones',
    'finalProduct',
    'authenticityEvidence',
    'primaryInterpretiveAct',
    'interpretationWitnessTaskIds',
    'misconceptionModels',
    'counterfactualVariant',
    'validationContract',
    'approvedProjection',
    'admissionStatus',
    'lineage'
  ], path, issues);

  const expectedCounts = { PBL3_LINEAR: 3, PBL4_BRANCH_MERGE: 4, PBL5_BOUNDED_DECISION: 5 };
  const expectedCount = expectedCounts[taskSet?.graphType];
  if (!expectedCount || taskSet?.tasks?.length !== expectedCount) issues.push(issue('PBL_TASK_COUNT_OR_GRAPH_INVALID', path));
  const tasks = taskSet?.tasks ?? [];
  const milestones = taskSet?.milestones ?? [];
  const taskIds = tasks.map((row) => row.taskId);
  const milestoneIds = milestones.map((row) => row.milestoneId);
  if (!unique(taskIds)) issues.push(issue('PBL_TASK_ID_DUPLICATED', path));
  if (!unique(milestoneIds)) issues.push(issue('PBL_MILESTONE_ID_DUPLICATED', path));
  const taskMap = new Map(tasks.map((row) => [row.taskId, row]));
  const milestoneMap = new Map(milestones.map((row) => [row.milestoneId, row]));
  const finalTasks = tasks.filter((row) => row.isFinalTask);
  if (finalTasks.length !== 1) issues.push(issue('PBL_FINAL_TASK_NOT_UNIQUE', path, { count: finalTasks.length }));

  for (const task of tasks) {
    if (task.sequenceIndex > 1 && (task.inputRefs?.length ?? 0) < 1) issues.push(issue('PBL_NON_INITIAL_TASK_WITHOUT_INPUT', `${path}.${task.taskId}`));
    for (const ref of task.inputRefs ?? []) {
      const milestone = milestoneMap.get(ref);
      if (!milestone) {
        issues.push(issue('PBL_INPUT_REF_UNRESOLVED', `${path}.${task.taskId}`, { ref }));
      } else {
        const producer = taskMap.get(milestone.producerTaskId);
        if (!producer || producer.sequenceIndex >= task.sequenceIndex) issues.push(issue('PBL_FORWARD_OR_INVALID_INPUT_REF', `${path}.${task.taskId}`, { ref }));
      }
    }
  }
  for (const milestone of milestones) {
    if (!taskMap.has(milestone.producerTaskId)) issues.push(issue('PBL_MILESTONE_PRODUCER_NOT_FOUND', path, { milestoneId: milestone.milestoneId }));
    for (const consumer of milestone.requiredByTaskIds ?? []) {
      if (!taskMap.has(consumer)) issues.push(issue('PBL_MILESTONE_CONSUMER_NOT_FOUND', path, { consumer }));
    }
    if (milestone.producerTaskId !== taskSet?.finalProduct?.finalTaskId && (milestone.requiredByTaskIds?.length ?? 0) === 0) {
      issues.push(issue('PBL_ORPHAN_MILESTONE', path, { milestoneId: milestone.milestoneId }));
    }
  }
  if (hasTaskCycle(tasks, milestones)) issues.push(issue('PBL_GRAPH_CYCLE', path));

  if (!taskSet?.finalProduct || !taskMap.has(taskSet.finalProduct.finalTaskId)) issues.push(issue('PBL_FINAL_PRODUCT_MISSING', path));
  if (finalTasks[0] && taskSet?.finalProduct?.finalTaskId !== finalTasks[0].taskId) issues.push(issue('PBL_FINAL_PRODUCT_TASK_MISMATCH', path));
  for (const ref of taskSet?.finalProduct?.requiredMilestoneIds ?? []) {
    if (!milestoneMap.has(ref)) issues.push(issue('PBL_FINAL_PRODUCT_MILESTONE_MISSING', path, { ref }));
  }
  if (taskSet?.graphType !== 'PBL3_LINEAR' && (taskSet?.finalProduct?.requiredMilestoneIds?.length ?? 0) < 2) {
    issues.push(issue('PBL_FINAL_PRODUCT_EVIDENCE_INSUFFICIENT', path));
  }
  if (!['APPROVED_COMPLETE_SINGLE_PAGE', 'APPROVED_COMPLETE_TWO_PAGE'].includes(taskSet?.approvedProjection)) {
    issues.push(issue('PBL_PROJECTION_UNAPPROVED', path));
  }
  for (const flag of ['contextNecessaryForDecision', 'removingContextDestroysTaskMeaning', 'finalProductUsableInContext', 'constraintsAreEventRealistic']) {
    if (taskSet?.authenticityEvidence?.[flag] !== true) issues.push(issue('PBL_AUTHENTICITY_FAILED', `${path}.authenticityEvidence.${flag}`));
  }
  if ((taskSet?.misconceptionModels?.length ?? 0) < 3) issues.push(issue('PBL_MISCONCEPTION_COVERAGE_INSUFFICIENT', path));
  if (!taskSet?.misconceptionModels?.some((row) => row.diagnosticClassification === 'CALCULATION_PASS_INTERPRETATION_FAIL')) {
    issues.push(issue('PBL_INTERPRETATION_DIAGNOSTIC_MISSING', path));
  }
  if (!authority?.knowledgePoints?.has(taskSet?.primaryKnowledgePointId)) issues.push(issue('APP_KNOWLEDGE_POINT_NOT_FOUND', `${path}.primaryKnowledgePointId`));
  for (const modelId of taskSet?.canonicalOperationModelIds ?? []) {
    if (!authority?.operationModels?.has(modelId)) issues.push(issue('APP_OPERATION_MODEL_NOT_FOUND', path, { modelId }));
  }
  if (!authority?.families?.has(taskSet?.globalContextFamilyId)) issues.push(issue('APP_CONTEXT_FAMILY_NOT_FOUND', `${path}.globalContextFamilyId`));
  const binding = authority?.bindings?.get(taskSet?.unitContextBindingId);
  if (!binding || !binding.applicationModes?.includes('PBL_TASK_SET')) issues.push(issue('APP_CONTEXT_BINDING_NOT_FOUND', `${path}.unitContextBindingId`));
  if (taskSet?.admissionStatus === 'PBL_PRODUCTION_ADMITTED') issues.push(issue('APP_A05_PRODUCTION_PBL_FORBIDDEN', path));
  return { ok: issues.length === 0, issues };
}

export function validateAdmissionRecord(record, path = 'admissionRecord') {
  const issues = [];
  requireFields(record, [
    'candidateId',
    'candidateType',
    'bindingId',
    'currentStage',
    'decision',
    'evidenceRefs',
    'blockingReasons',
    'productionAdmissionAllowed'
  ], path, issues);
  if (record?.decision === 'PRODUCTION_ADMITTED') {
    if (record.productionAdmissionAllowed !== true) issues.push(issue('APP_PRODUCTION_ADMISSION_FLAG_INVALID', path));
    if ((record.evidenceRefs?.length ?? 0) < 3) issues.push(issue('APP_PRODUCTION_EVIDENCE_INSUFFICIENT', path));
    if ((record.blockingReasons?.length ?? 0) !== 0) issues.push(issue('APP_PRODUCTION_BLOCKER_PRESENT', path));
    if (record?.review?.reviewStatus !== 'PASS') issues.push(issue('APP_PRODUCTION_REVIEW_NOT_PASS', path));
  } else if (record?.productionAdmissionAllowed !== false) {
    issues.push(issue('APP_NON_PRODUCTION_RECORD_MUST_FAIL_CLOSED', path));
  }
  return { ok: issues.length === 0, issues };
}

export function validateApplicationPilotBundle(bundle, { unitRegistry, contextRegistry }) {
  const proofs = bundle?.nPlusOneProofs ?? [];
  const pblTaskSets = bundle?.pblTaskSets ?? [];
  const bindings = bundle?.contextBindings ?? [];
  const authority = buildApplicationAuthority({ unitRegistry, contextRegistry, bindings, proofs, pblTaskSets });
  const results = [];

  for (const [index, proof] of proofs.entries()) {
    results.push({ kind: 'N_PLUS_ONE_PROOF', id: proof.proofId, ...validateNPlusOneProof(proof, `nPlusOneProofs[${index}]`) });
  }
  for (const [index, binding] of bindings.entries()) {
    results.push({ kind: 'CONTEXT_BINDING', id: binding.bindingId, ...validateApplicationContextBinding(binding, authority, `contextBindings[${index}]`) });
  }
  for (const [index, item] of (bundle?.singleItems ?? []).entries()) {
    results.push({ kind: 'SINGLE_ITEM', id: item.itemId, ...validateSingleApplicationItem(item, authority, `singleItems[${index}]`) });
  }
  for (const [index, taskSet] of pblTaskSets.entries()) {
    results.push({ kind: 'PBL_TASK_SET', id: taskSet.pblTaskSetId, ...validatePblTaskSet(taskSet, authority, `pblTaskSets[${index}]`) });
  }
  for (const [index, record] of (bundle?.admissionRecords ?? []).entries()) {
    results.push({ kind: 'ADMISSION_RECORD', id: record.candidateId, ...validateAdmissionRecord(record, `admissionRecords[${index}]`) });
  }

  const issues = results.flatMap((row) => row.issues.map((entry) => ({ ...entry, kind: row.kind, id: row.id })));
  const productionAdmissionCount = (bundle?.admissionRecords ?? []).filter((row) => row.productionAdmissionAllowed === true).length;
  if (productionAdmissionCount > 0) {
    issues.push(issue('APP_A05_PRODUCTION_ADMISSION_FORBIDDEN', 'admissionRecords', { productionAdmissionCount }));
  }

  return {
    ok: issues.length === 0,
    sourceId: bundle?.sourceId ?? null,
    counts: {
      proofs: proofs.length,
      contextBindings: bindings.length,
      singleItems: bundle?.singleItems?.length ?? 0,
      pblTaskSets: pblTaskSets.length,
      admissionRecords: bundle?.admissionRecords?.length ?? 0,
      productionAdmissions: productionAdmissionCount
    },
    results,
    issues
  };
}

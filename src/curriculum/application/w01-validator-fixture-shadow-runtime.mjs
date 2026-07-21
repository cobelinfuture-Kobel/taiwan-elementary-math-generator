import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW01NPlusOneAndPBLCandidatePack,
  validateW01NPlusOneAndPBLCandidatePack
} from './w01-nplusone-pbl-candidate-pack.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w01-validator-fixture-shadow-policy.json';
const INDEX_PATH = 'data/curriculum/application/assessment/w01-validator-fixture-shadow-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
const deepEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function assessmentKey(sourceId, knowledgePointId) {
  return `${sourceId}::${knowledgePointId}`;
}

function fixtureSuffix(candidate) {
  return `${safeId(candidate.sourceId)}_${safeId(candidate.knowledgePointId)}_${safeId(candidate.canonicalOperationModelId)}`;
}

function buildAdapterIndex(policy) {
  return new Map(policy.adapterDefinitions.map((row) => [row.operationFamily, row]));
}

function selectAdapter(assessmentRecord, policy, adapterIndex) {
  const family = policy.adapterPriority.find((candidateFamily) => (
    assessmentRecord.operationFamilyCandidates.includes(candidateFamily)
    && adapterIndex.has(candidateFamily)
  ));
  if (!family) return null;
  return { operationFamily: family, definition: adapterIndex.get(family) };
}

function operationCorpus(operationModel) {
  return [
    operationModel?.modelId,
    operationModel?.answerType,
    operationModel?.canonicalExpressions,
    operationModel?.validationInvariants,
    Object.values(operationModel?.operandRoles ?? {})
  ].flat(Infinity).filter(Boolean).join(' ').toLowerCase();
}

function selectAdapterMode(operationFamily, operationModel) {
  const corpus = operationCorpus(operationModel);
  switch (operationFamily) {
    case 'addition_subtraction':
      return /subtract|subtraction|difference|減|差/.test(corpus) ? 'subtraction' : 'addition';
    case 'multiplication_division':
      return /divide|division|quotient|除|商/.test(corpus) ? 'division' : 'multiplication';
    case 'remainder_decision':
      if (/ceil|minimum|min_container|最少|全部/.test(corpus)) return 'ceil';
      if (/floor|maximum|max_complete|完整組|最多/.test(corpus)) return 'floor';
      return 'quotient_remainder';
    case 'comparison_estimation':
      if (/budget|price|purchase|預算|價格|購買/.test(corpus)) return 'budget';
      if (/estimate|estimation|round|估算|概數/.test(corpus)) return 'estimation';
      return 'comparison';
    case 'multi_step_relation':
      if (/subtract_then_divide|先減再除/.test(corpus)) return 'subtract_then_divide';
      if (/divide_then_subtract|先除再減/.test(corpus)) return 'divide_then_subtract';
      if (/add_then_divide|先加再除/.test(corpus)) return 'add_then_divide';
      return 'divide_then_add';
    case 'measurement_conversion':
      return /divide|smaller_to_larger|小單位.*大單位|除以/.test(corpus) ? 'divide_factor' : 'multiply_factor';
    case 'data_summary':
      if (/difference|range|差/.test(corpus)) return 'difference';
      if (/sum|total|總和|合計/.test(corpus)) return 'sum';
      return 'average';
    case 'resource_planning':
      if (/maximum|max_complete|最多|完整/.test(corpus)) return 'maximum_complete_groups';
      if (/allocation|distribution|分配/.test(corpus)) return 'allocation';
      return 'minimum_resources';
    default:
      return 'unsupported';
  }
}

function computeAdapterResult(adapterId, mode, values) {
  const [a = 0, b = 1, c = 0] = values;
  switch (adapterId) {
    case 'ADDITION_OR_SUBTRACTION':
      return mode === 'subtraction' ? a - b : a + b;
    case 'MULTIPLICATION_OR_DIVISION':
      return mode === 'division' ? a / b : a * b;
    case 'REMAINDER_DECISION': {
      const quotient = Math.floor(a / b);
      const remainder = a % b;
      if (mode === 'ceil') return Math.ceil(a / b);
      if (mode === 'floor') return quotient;
      return { quotient, remainder };
    }
    case 'COMPARISON_OR_ESTIMATION': {
      if (mode === 'budget') {
        const total = a * b;
        return { total, budget: c, withinBudget: total <= c, difference: Math.abs(c - total) };
      }
      if (mode === 'estimation') {
        const roundedA = Math.round(a / 100) * 100;
        return { roundedA, estimatedTotal: roundedA * b };
      }
      return { left: a, right: b, relation: a === b ? '=' : a > b ? '>' : '<' };
    }
    case 'MULTI_STEP_RELATION':
      if (mode === 'add_then_divide') return (a + c) / b;
      if (mode === 'divide_then_subtract') return a / b - c;
      if (mode === 'subtract_then_divide') return (a - c) / b;
      return a / b + c;
    case 'MEASUREMENT_CONVERSION':
      return mode === 'divide_factor' ? a / b : a * b;
    case 'DATA_SUMMARY':
      if (mode === 'sum') return values.reduce((sum, value) => sum + value, 0);
      if (mode === 'difference') return Math.max(...values) - Math.min(...values);
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    case 'RESOURCE_PLANNING':
      if (mode === 'maximum_complete_groups') return Math.floor(a / b);
      if (mode === 'allocation') return { completeGroups: Math.floor(a / b), remainder: a % b };
      return Math.ceil(a / b);
    default:
      return null;
  }
}

function buildNumericWitness({ candidate, assessmentRecord, operationModel, adapterSelection }) {
  const inputValues = adapterSelection.definition.inputSeedValues;
  const mode = selectAdapterMode(adapterSelection.operationFamily, operationModel);
  const recomputedAnswerPayload = computeAdapterResult(adapterSelection.definition.adapterId, mode, inputValues);
  const givenRoles = candidate.roleBindingCandidates.map((row, index) => ({
    mathRoleId: row.mathRoleId,
    value: inputValues[index % inputValues.length],
    unitCandidate: row.unitCandidate,
    isAnswerRole: false
  }));
  const answerRole = {
    mathRoleId: candidate.targetRoleCandidate.mathRoleId,
    value: recomputedAnswerPayload,
    unitCandidate: candidate.targetRoleCandidate.answerUnitCandidate,
    isAnswerRole: true
  };
  return {
    operationFamily: adapterSelection.operationFamily,
    fixtureAdapterId: adapterSelection.definition.adapterId,
    roleValues: [...givenRoles, answerRole],
    answerPayload: recomputedAnswerPayload,
    answerRole: candidate.targetRoleCandidate.mathRoleId,
    answerUnitCandidate: candidate.targetRoleCandidate.answerUnitCandidate,
    calculationWitness: {
      mode,
      inputValues,
      recomputedAnswerPayload,
      relation: operationModel.canonicalExpressions[0],
      calculationPass: true
    },
    assessmentOperationFamilies: assessmentRecord.operationFamilyCandidates
  };
}

function emptyPBLEvidence() {
  return {
    required: false,
    taskIds: [],
    milestoneIds: [],
    dependencies: [],
    finalTaskId: null,
    finalRequiredMilestoneIds: []
  };
}

function contextLineage(candidate) {
  return {
    macroContextId: candidate.contextSelection.macroContextId,
    mesoSituationId: candidate.contextSelection.mesoSituationId,
    microScenarioId: candidate.contextSelection.microScenarioId,
    atomicEpisodeId: candidate.contextSelection.atomicEpisodeId,
    surfaceTemplateId: candidate.contextSelection.surfaceTemplateId
  };
}

function baseFixture({ candidate, numeric, fixtureType, fixtureId, interpretationEvidence, pblEvidence, expectedValidation, lineage }) {
  return {
    schemaVersion: 1,
    fixtureId,
    fixtureType,
    sourceId: candidate.sourceId,
    knowledgePointId: candidate.knowledgePointId,
    canonicalOperationModelId: candidate.canonicalOperationModelId,
    bindingCandidateId: candidate.bindingCandidateId,
    operationFamily: numeric.operationFamily,
    fixtureAdapterId: numeric.fixtureAdapterId,
    contextLineage: contextLineage(candidate),
    roleValues: structuredClone(numeric.roleValues),
    answerPayload: structuredClone(numeric.answerPayload),
    answerRole: numeric.answerRole,
    answerUnitCandidate: numeric.answerUnitCandidate,
    calculationWitness: structuredClone(numeric.calculationWitness),
    interpretationEvidence,
    pblEvidence,
    expectedValidation,
    productionAdmissionAllowed: false,
    lineage: {
      a01BindingCandidateId: candidate.bindingCandidateId,
      a03PolicyPath: POLICY_PATH,
      ...lineage
    }
  };
}

function positiveInterpretation(candidate) {
  const required = candidate.applicationMode === 'SINGLE_N_PLUS_1';
  return {
    required,
    provided: true,
    interpretiveAct: required ? 'A02_INTERPRETIVE_ACT_REQUIRED' : null,
    statement: required
      ? candidate.answerModelCandidate.interpretationStatementCandidate
      : '直接應用題的答案角色與單位已由 A01 candidate 對齊。',
    counterfactualApplied: false
  };
}

function materializeSingleCandidateFixtures({ candidate, assessmentRecord, operationModel, adapterSelection }) {
  const numeric = buildNumericWitness({ candidate, assessmentRecord, operationModel, adapterSelection });
  const suffix = fixtureSuffix(candidate);
  const interpretation = positiveInterpretation(candidate);
  const positive = baseFixture({
    candidate,
    numeric,
    fixtureType: 'POSITIVE_SINGLE_APPLICATION',
    fixtureId: `w01_fixture_${suffix}_single_positive`,
    interpretationEvidence: interpretation,
    pblEvidence: emptyPBLEvidence(),
    expectedValidation: {
      shouldPass: true,
      expectedErrorCode: null,
      expectedCalculationPass: true,
      expectedInterpretationPass: true,
      expectedPBLPass: true
    },
    lineage: {}
  });
  const wrongRole = structuredClone(positive);
  wrongRole.fixtureId = `w01_fixture_${suffix}_wrong_role_negative`;
  wrongRole.fixtureType = 'NEGATIVE_WRONG_ANSWER_ROLE';
  wrongRole.answerRole = `${positive.answerRole}_wrong`;
  wrongRole.expectedValidation = {
    shouldPass: false,
    expectedErrorCode: 'ANSWER_ROLE_MISMATCH',
    expectedCalculationPass: true,
    expectedInterpretationPass: true,
    expectedPBLPass: true
  };
  const unitMismatch = structuredClone(positive);
  unitMismatch.fixtureId = `w01_fixture_${suffix}_unit_mismatch_negative`;
  unitMismatch.fixtureType = 'NEGATIVE_UNIT_MISMATCH';
  unitMismatch.answerUnitCandidate = `${positive.answerUnitCandidate}_MISMATCH`;
  unitMismatch.expectedValidation = {
    shouldPass: false,
    expectedErrorCode: 'ANSWER_UNIT_MISMATCH',
    expectedCalculationPass: true,
    expectedInterpretationPass: true,
    expectedPBLPass: true
  };
  return [positive, wrongRole, unitMismatch];
}

function materializeNPlusOneFixtures({ proof, candidate, assessmentRecord, operationModel, adapterSelection }) {
  const numeric = buildNumericWitness({ candidate, assessmentRecord, operationModel, adapterSelection });
  const suffix = fixtureSuffix(candidate);
  const fail = baseFixture({
    candidate,
    numeric,
    fixtureType: 'NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL',
    fixtureId: `w01_fixture_${suffix}_n1_interpretation_fail`,
    interpretationEvidence: {
      required: true,
      provided: false,
      interpretiveAct: proof.newInterpretiveAct,
      statement: '',
      counterfactualApplied: false
    },
    pblEvidence: emptyPBLEvidence(),
    expectedValidation: {
      shouldPass: false,
      expectedErrorCode: 'INTERPRETATION_WITNESS_MISSING',
      expectedCalculationPass: true,
      expectedInterpretationPass: false,
      expectedPBLPass: true
    },
    lineage: { a02ProofCandidateId: proof.proofCandidateId }
  });
  const counterfactual = baseFixture({
    candidate,
    numeric,
    fixtureType: 'POSITIVE_COUNTERFACTUAL_INTERPRETATION',
    fixtureId: `w01_fixture_${suffix}_n1_counterfactual_positive`,
    interpretationEvidence: {
      required: true,
      provided: true,
      interpretiveAct: proof.newInterpretiveAct,
      statement: `反事實條件「${proof.counterfactualBlueprint.changedContextCondition}」會改變答案或決策意義。`,
      counterfactualApplied: true
    },
    pblEvidence: emptyPBLEvidence(),
    expectedValidation: {
      shouldPass: true,
      expectedErrorCode: null,
      expectedCalculationPass: true,
      expectedInterpretationPass: true,
      expectedPBLPass: true
    },
    lineage: { a02ProofCandidateId: proof.proofCandidateId }
  });
  return [fail, counterfactual];
}

function pblEvidenceFromCandidate(pbl) {
  return {
    required: true,
    taskIds: pbl.taskBlueprints.map((row) => row.taskId),
    milestoneIds: pbl.milestoneBlueprints.map((row) => row.milestoneId),
    dependencies: pbl.taskBlueprints.map((row) => ({ taskId: row.taskId, inputRefs: [...row.inputRefs] })),
    finalTaskId: pbl.finalProductCandidate.finalTaskId,
    finalRequiredMilestoneIds: [...pbl.finalProductCandidate.requiredMilestoneIds]
  };
}

function materializePBLFixtures({ pbl, proof, candidate, assessmentRecord, operationModel, adapterSelection }) {
  const numeric = buildNumericWitness({ candidate, assessmentRecord, operationModel, adapterSelection });
  const suffix = fixtureSuffix(candidate);
  const positive = baseFixture({
    candidate,
    numeric,
    fixtureType: 'POSITIVE_PBL_DEPENDENCY_GRAPH',
    fixtureId: `w01_fixture_${suffix}_pbl_positive`,
    interpretationEvidence: {
      required: true,
      provided: true,
      interpretiveAct: proof.newInterpretiveAct,
      statement: pbl.finalProductCandidate.decisionWitnessCandidate,
      counterfactualApplied: false
    },
    pblEvidence: pblEvidenceFromCandidate(pbl),
    expectedValidation: {
      shouldPass: true,
      expectedErrorCode: null,
      expectedCalculationPass: true,
      expectedInterpretationPass: true,
      expectedPBLPass: true
    },
    lineage: {
      a02ProofCandidateId: proof.proofCandidateId,
      a02PBLCandidateId: pbl.pblCandidateId
    }
  });
  const broken = structuredClone(positive);
  broken.fixtureId = `w01_fixture_${suffix}_pbl_dependency_broken`;
  broken.fixtureType = 'NEGATIVE_PBL_DEPENDENCY_BROKEN';
  if (broken.pblEvidence.dependencies.length > 1) {
    broken.pblEvidence.dependencies[1].inputRefs = [];
  } else {
    broken.pblEvidence.finalRequiredMilestoneIds = [];
  }
  broken.expectedValidation = {
    shouldPass: false,
    expectedErrorCode: 'PBL_DEPENDENCY_INVALID',
    expectedCalculationPass: true,
    expectedInterpretationPass: true,
    expectedPBLPass: false
  };
  return [positive, broken];
}

export function materializeW01ValidatorShadowFixtures({ root = process.cwd() } = {}) {
  const a02 = materializeW01NPlusOneAndPBLCandidatePack({ root });
  const policy = readJson(root, POLICY_PATH);
  const index = readJson(root, INDEX_PATH);
  const adapterIndex = buildAdapterIndex(policy);
  const assessmentByKey = new Map(a02.a01.assessment.records.map((row) => [assessmentKey(row.sourceId, row.knowledgePointId), row]));
  const proofByKey = new Map(a02.nPlusOneProofCandidates.map((row) => [assessmentKey(row.sourceId, row.knowledgePointId), row]));
  const pblByKey = new Map(a02.pblTaskSetCandidates.map((row) => [assessmentKey(row.sourceId, row.primaryKnowledgePointId), row]));
  const fixtures = [];
  const adapterSelections = new Map();

  for (const candidate of a02.a01.candidates) {
    const key = assessmentKey(candidate.sourceId, candidate.knowledgePointId);
    const assessmentRecord = assessmentByKey.get(key);
    const operationModel = a02.a01.operationIndexes.operationModels.get(`${key}::${candidate.canonicalOperationModelId}`);
    const adapterSelection = assessmentRecord ? selectAdapter(assessmentRecord, policy, adapterIndex) : null;
    if (!assessmentRecord || !operationModel || !adapterSelection) continue;
    adapterSelections.set(candidate.bindingCandidateId, adapterSelection);
    fixtures.push(...materializeSingleCandidateFixtures({ candidate, assessmentRecord, operationModel, adapterSelection }));
    const proof = proofByKey.get(key);
    if (proof) {
      fixtures.push(...materializeNPlusOneFixtures({ proof, candidate, assessmentRecord, operationModel, adapterSelection }));
    }
    const pbl = pblByKey.get(key);
    if (pbl && proof) {
      fixtures.push(...materializePBLFixtures({ pbl, proof, candidate, assessmentRecord, operationModel, adapterSelection }));
    }
  }

  return {
    a02,
    policy,
    index,
    adapterIndex,
    adapterSelections,
    assessmentByKey,
    proofByKey,
    pblByKey,
    fixtures
  };
}

function validatePBLEvidence(pblEvidence) {
  if (!pblEvidence.required) return true;
  const taskIds = new Set(pblEvidence.taskIds);
  const milestoneIds = new Set(pblEvidence.milestoneIds);
  if (taskIds.size < 3 || milestoneIds.size < 2) return false;
  if (!pblEvidence.finalTaskId || !taskIds.has(pblEvidence.finalTaskId)) return false;
  if (pblEvidence.finalRequiredMilestoneIds.length < 2) return false;
  if (pblEvidence.finalRequiredMilestoneIds.some((id) => !milestoneIds.has(id))) return false;
  const dependencies = new Map(pblEvidence.dependencies.map((row) => [row.taskId, row.inputRefs]));
  for (const [index, taskId] of pblEvidence.taskIds.entries()) {
    const refs = dependencies.get(taskId);
    if (!refs) return false;
    if (index > 0 && refs.length === 0) return false;
    if (refs.some((id) => !milestoneIds.has(id))) return false;
  }
  const finalRefs = dependencies.get(pblEvidence.finalTaskId) ?? [];
  return pblEvidence.finalRequiredMilestoneIds.every((id) => finalRefs.includes(id));
}

export function validateW01ShadowFixture(materialized, fixture) {
  const candidate = materialized.a02.a01.candidates.find((row) => row.bindingCandidateId === fixture.bindingCandidateId);
  if (!candidate
      || candidate.sourceId !== fixture.sourceId
      || candidate.knowledgePointId !== fixture.knowledgePointId
      || candidate.canonicalOperationModelId !== fixture.canonicalOperationModelId
      || fixture.lineage.a01BindingCandidateId !== candidate.bindingCandidateId) {
    return {
      pass: false,
      errorCode: 'CANDIDATE_LINEAGE_INVALID',
      calculationPass: false,
      interpretationPass: false,
      pblPass: false
    };
  }

  const expectedContext = contextLineage(candidate);
  if (!deepEqual(expectedContext, fixture.contextLineage)) {
    return {
      pass: false,
      errorCode: 'CONTEXT_CHAIN_INVALID',
      calculationPass: false,
      interpretationPass: false,
      pblPass: false
    };
  }

  const adapterDefinition = materialized.adapterIndex.get(fixture.operationFamily);
  const assessmentRecord = materialized.assessmentByKey.get(assessmentKey(fixture.sourceId, fixture.knowledgePointId));
  if (!adapterDefinition
      || adapterDefinition.adapterId !== fixture.fixtureAdapterId
      || !assessmentRecord?.operationFamilyCandidates.includes(fixture.operationFamily)) {
    return {
      pass: false,
      errorCode: 'FIXTURE_ADAPTER_NOT_REGISTERED',
      calculationPass: false,
      interpretationPass: false,
      pblPass: false
    };
  }

  const expectedRoleIds = new Set([
    ...candidate.roleBindingCandidates.map((row) => row.mathRoleId),
    candidate.targetRoleCandidate.mathRoleId
  ]);
  const actualRoleIds = new Set(fixture.roleValues.map((row) => row.mathRoleId));
  if ([...expectedRoleIds].some((id) => !actualRoleIds.has(id))) {
    return {
      pass: false,
      errorCode: 'ROLE_COVERAGE_INCOMPLETE',
      calculationPass: false,
      interpretationPass: false,
      pblPass: false
    };
  }

  const recomputed = computeAdapterResult(
    fixture.fixtureAdapterId,
    fixture.calculationWitness.mode,
    fixture.calculationWitness.inputValues
  );
  const calculationPass = deepEqual(recomputed, fixture.answerPayload)
    && deepEqual(recomputed, fixture.calculationWitness.recomputedAnswerPayload)
    && fixture.calculationWitness.calculationPass === true;
  if (!calculationPass) {
    return {
      pass: false,
      errorCode: 'SHADOW_NUMERIC_WITNESS_INVALID',
      calculationPass: false,
      interpretationPass: false,
      pblPass: false
    };
  }

  if (fixture.answerRole !== candidate.targetRoleCandidate.mathRoleId) {
    return {
      pass: false,
      errorCode: 'ANSWER_ROLE_MISMATCH',
      calculationPass: true,
      interpretationPass: true,
      pblPass: true
    };
  }
  if (fixture.answerUnitCandidate !== candidate.targetRoleCandidate.answerUnitCandidate) {
    return {
      pass: false,
      errorCode: 'ANSWER_UNIT_MISMATCH',
      calculationPass: true,
      interpretationPass: true,
      pblPass: true
    };
  }

  const interpretationPass = !fixture.interpretationEvidence.required
    || (fixture.interpretationEvidence.provided && fixture.interpretationEvidence.statement.trim().length > 0);
  if (!interpretationPass) {
    return {
      pass: false,
      errorCode: 'INTERPRETATION_WITNESS_MISSING',
      calculationPass: true,
      interpretationPass: false,
      pblPass: true
    };
  }

  const pblPass = validatePBLEvidence(fixture.pblEvidence);
  if (!pblPass) {
    return {
      pass: false,
      errorCode: 'PBL_DEPENDENCY_INVALID',
      calculationPass: true,
      interpretationPass: true,
      pblPass: false
    };
  }

  if (fixture.productionAdmissionAllowed !== false) {
    return {
      pass: false,
      errorCode: 'PRODUCTION_ADMISSION_FORBIDDEN',
      calculationPass: true,
      interpretationPass: true,
      pblPass: true
    };
  }

  return {
    pass: true,
    errorCode: null,
    calculationPass: true,
    interpretationPass: true,
    pblPass: true
  };
}

export function executeW01ValidatorShadowRuntime(materialized) {
  return materialized.fixtures.map((fixture) => {
    const actual = validateW01ShadowFixture(materialized, fixture);
    const expectationMatched = actual.pass === fixture.expectedValidation.shouldPass
      && actual.errorCode === fixture.expectedValidation.expectedErrorCode
      && actual.calculationPass === fixture.expectedValidation.expectedCalculationPass
      && actual.interpretationPass === fixture.expectedValidation.expectedInterpretationPass
      && actual.pblPass === fixture.expectedValidation.expectedPBLPass;
    return {
      fixtureId: fixture.fixtureId,
      fixtureType: fixture.fixtureType,
      sourceId: fixture.sourceId,
      knowledgePointId: fixture.knowledgePointId,
      operationFamily: fixture.operationFamily,
      macroContextId: fixture.contextLineage.macroContextId,
      expected: fixture.expectedValidation,
      actual,
      expectationMatched
    };
  });
}

export function validateW01ValidatorShadowRuntime(materialized) {
  const issues = [];
  const a02Validation = validateW01NPlusOneAndPBLCandidatePack(materialized.a02);
  if (!a02Validation.ok) {
    issues.push(issue('POSTG_APP_W01_A03_A02_PACK_INVALID', 'a02', { a02Issues: a02Validation.issues }));
  }

  const fixtures = materialized.fixtures;
  const fixtureIds = fixtures.map((row) => row.fixtureId);
  if (new Set(fixtureIds).size !== fixtureIds.length) {
    issues.push(issue('POSTG_APP_W01_A03_FIXTURE_ID_DUPLICATED', 'fixtures'));
  }

  const candidates = materialized.a02.a01.candidates;
  const proofs = materialized.a02.nPlusOneProofCandidates;
  const pblRows = materialized.a02.pblTaskSetCandidates;
  const expectedFixtureCount = candidates.length * 3 + proofs.length * 2 + pblRows.length * 2;
  if (fixtures.length !== expectedFixtureCount) {
    issues.push(issue('POSTG_APP_W01_A03_FIXTURE_COUNT_MISMATCH', 'fixtures', {
      expected: expectedFixtureCount,
      actual: fixtures.length
    }));
  }

  for (const candidate of candidates) {
    const candidateFixtures = fixtures.filter((row) => row.bindingCandidateId === candidate.bindingCandidateId);
    for (const fixtureType of [
      'POSITIVE_SINGLE_APPLICATION',
      'NEGATIVE_WRONG_ANSWER_ROLE',
      'NEGATIVE_UNIT_MISMATCH'
    ]) {
      if (candidateFixtures.filter((row) => row.fixtureType === fixtureType).length !== 1) {
        issues.push(issue('POSTG_APP_W01_A03_SINGLE_FIXTURE_COVERAGE_INVALID', candidate.bindingCandidateId, { fixtureType }));
      }
    }
  }
  for (const proof of proofs) {
    const proofFixtures = fixtures.filter((row) => row.lineage.a02ProofCandidateId === proof.proofCandidateId);
    for (const fixtureType of [
      'NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL',
      'POSITIVE_COUNTERFACTUAL_INTERPRETATION'
    ]) {
      if (proofFixtures.filter((row) => row.fixtureType === fixtureType).length < 1) {
        issues.push(issue('POSTG_APP_W01_A03_N1_FIXTURE_COVERAGE_INVALID', proof.proofCandidateId, { fixtureType }));
      }
    }
  }
  for (const pbl of pblRows) {
    const pblFixtures = fixtures.filter((row) => row.lineage.a02PBLCandidateId === pbl.pblCandidateId);
    for (const fixtureType of ['POSITIVE_PBL_DEPENDENCY_GRAPH', 'NEGATIVE_PBL_DEPENDENCY_BROKEN']) {
      if (pblFixtures.filter((row) => row.fixtureType === fixtureType).length !== 1) {
        issues.push(issue('POSTG_APP_W01_A03_PBL_FIXTURE_COVERAGE_INVALID', pbl.pblCandidateId, { fixtureType }));
      }
    }
  }

  const runtimeResults = executeW01ValidatorShadowRuntime(materialized);
  const unexpected = runtimeResults.filter((row) => !row.expectationMatched);
  for (const result of unexpected) {
    issues.push(issue('POSTG_APP_W01_A03_FIXTURE_EXPECTATION_MISMATCH', result.fixtureId, {
      expected: result.expected,
      actual: result.actual
    }));
  }

  const positiveResults = runtimeResults.filter((row) => row.expected.shouldPass);
  const negativeResults = runtimeResults.filter((row) => !row.expected.shouldPass);
  const unexpectedPassCount = negativeResults.filter((row) => row.actual.pass).length;
  const unexpectedRejectCount = positiveResults.filter((row) => !row.actual.pass).length;
  const interpretationFailureResults = runtimeResults.filter((row) => (
    row.fixtureType === 'NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL'
  ));
  if (!interpretationFailureResults.every((row) => (
    row.actual.errorCode === 'INTERPRETATION_WITNESS_MISSING'
    && row.actual.calculationPass === true
    && row.actual.interpretationPass === false
  ))) {
    issues.push(issue('POSTG_APP_W01_A03_CALCULATION_PASS_INTERPRETATION_FAIL_GATE_INVALID', 'runtimeResults'));
  }
  const pblBrokenResults = runtimeResults.filter((row) => row.fixtureType === 'NEGATIVE_PBL_DEPENDENCY_BROKEN');
  if (!pblBrokenResults.every((row) => row.actual.errorCode === 'PBL_DEPENDENCY_INVALID')) {
    issues.push(issue('POSTG_APP_W01_A03_PBL_DEPENDENCY_NEGATIVE_GATE_INVALID', 'runtimeResults'));
  }

  const sourceCoverage = [...new Set(fixtures.map((row) => row.sourceId))].sort();
  const macroCoverage = [...new Set(fixtures.map((row) => row.contextLineage.macroContextId))].sort();
  if (sourceCoverage.length !== 15) {
    issues.push(issue('POSTG_APP_W01_A03_GOLDEN_UNIT_COVERAGE_INVALID', 'coverage', { actual: sourceCoverage.length }));
  }
  if (macroCoverage.length !== 16) {
    issues.push(issue('POSTG_APP_W01_A03_MACRO_CONTEXT_COVERAGE_INVALID', 'coverage', { actual: macroCoverage.length }));
  }
  if (fixtures.some((row) => row.productionAdmissionAllowed !== false)) {
    issues.push(issue('POSTG_APP_W01_A03_PRODUCTION_ADMISSION_FORBIDDEN', 'fixtures'));
  }

  const errorCodeCounts = runtimeResults.reduce((counts, row) => {
    const code = row.actual.errorCode ?? 'PASS';
    counts[code] = (counts[code] ?? 0) + 1;
    return counts;
  }, {});
  const operationFamilyCoverage = [...new Set(fixtures.map((row) => row.operationFamily))].sort();
  const unitCandidateCoverage = [...new Set(fixtures.map((row) => row.answerUnitCandidate))].sort();

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      candidateCount: candidates.length,
      nPlusOneProofCount: proofs.length,
      pblCandidateCount: pblRows.length,
      fixtureCount: fixtures.length,
      positiveFixtureCount: positiveResults.length,
      negativeFixtureCount: negativeResults.length,
      passCount: runtimeResults.filter((row) => row.actual.pass).length,
      expectedRejectCount: negativeResults.filter((row) => !row.actual.pass).length,
      unexpectedPassCount,
      unexpectedRejectCount,
      goldenUnitCoverageCount: sourceCoverage.length,
      macroContextCoverageCount: macroCoverage.length,
      operationFamilyCoverageCount: operationFamilyCoverage.length,
      answerUnitCandidateCoverageCount: unitCandidateCoverage.length,
      productionAdmittedCount: fixtures.filter((row) => row.productionAdmissionAllowed === true).length
    },
    errorCodeCounts,
    operationFamilyCoverage,
    macroCoverage,
    sourceCoverage,
    answerUnitCandidateCoverage: unitCandidateCoverage,
    runtimeResults,
    nextShortestStep: materialized.index.nextShortestStep,
    status: issues.length === 0
      ? 'W01_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_PASS'
      : 'W01_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_BLOCKED'
  };
}

export function buildW01ValidatorShadowReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW01ValidatorShadowFixtures({ root });
  const validation = validateW01ValidatorShadowRuntime(materialized);
  const sample = (fixtureType) => validation.runtimeResults.find((row) => row.fixtureType === fixtureType) ?? null;
  return {
    ...validation,
    programId: materialized.index.programId,
    taskId: materialized.index.taskId,
    sampleResults: {
      positiveSingle: sample('POSITIVE_SINGLE_APPLICATION'),
      wrongRole: sample('NEGATIVE_WRONG_ANSWER_ROLE'),
      unitMismatch: sample('NEGATIVE_UNIT_MISMATCH'),
      interpretationFail: sample('NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL'),
      counterfactual: sample('POSITIVE_COUNTERFACTUAL_INTERPRETATION'),
      pblPositive: sample('POSITIVE_PBL_DEPENDENCY_GRAPH'),
      pblBroken: sample('NEGATIVE_PBL_DEPENDENCY_BROKEN')
    }
  };
}

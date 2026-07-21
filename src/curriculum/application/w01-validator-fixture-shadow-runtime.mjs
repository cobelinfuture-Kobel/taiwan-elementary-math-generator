import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW01NPlusOneAndPBLCandidatePack,
  validateW01NPlusOneAndPBLCandidatePack
} from './w01-nplusone-pbl-candidate-pack.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w01-validator-fixture-shadow-policy.json';
const INDEX_PATH = 'data/curriculum/application/assessment/w01-validator-fixture-shadow-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const keyOf = (sourceId, knowledgePointId) => `${sourceId}::${knowledgePointId}`;
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
const deepEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const sortedUnique = (values) => [...new Set(values)].sort();

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function operationCorpus(model) {
  return [
    model?.modelId,
    model?.answerType,
    model?.canonicalExpressions,
    model?.validationInvariants,
    Object.values(model?.operandRoles ?? {})
  ].flat(Infinity).filter(Boolean).join(' ').toLowerCase();
}

function selectMode(family, model) {
  const corpus = operationCorpus(model);
  const contains = (pattern) => pattern.test(corpus);
  if (family === 'addition_subtraction') return contains(/subtract|subtraction|difference|減|差/) ? 'subtraction' : 'addition';
  if (family === 'multiplication_division') return contains(/divide|division|quotient|除|商/) ? 'division' : 'multiplication';
  if (family === 'remainder_decision') {
    if (contains(/ceil|minimum|min_container|最少|全部/)) return 'ceil';
    if (contains(/floor|maximum|max_complete|完整組|最多/)) return 'floor';
    return 'quotient_remainder';
  }
  if (family === 'comparison_estimation') {
    if (contains(/budget|price|purchase|預算|價格|購買/)) return 'budget';
    if (contains(/estimate|estimation|round|估算|概數/)) return 'estimation';
    return 'comparison';
  }
  if (family === 'multi_step_relation') {
    if (contains(/subtract_then_divide|先減再除/)) return 'subtract_then_divide';
    if (contains(/divide_then_subtract|先除再減/)) return 'divide_then_subtract';
    if (contains(/add_then_divide|先加再除/)) return 'add_then_divide';
    return 'divide_then_add';
  }
  if (family === 'measurement_conversion') return contains(/divide|smaller_to_larger|小單位.*大單位|除以/) ? 'divide_factor' : 'multiply_factor';
  if (family === 'data_summary') {
    if (contains(/difference|range|差/)) return 'difference';
    if (contains(/sum|total|總和|合計/)) return 'sum';
    return 'average';
  }
  if (family === 'resource_planning') {
    if (contains(/maximum|max_complete|最多|完整/)) return 'maximum_complete_groups';
    if (contains(/allocation|distribution|分配/)) return 'allocation';
    return 'minimum_resources';
  }
  return 'unsupported';
}

function compute(adapterId, mode, values) {
  const [a = 0, b = 1, c = 0] = values;
  if (adapterId === 'ADDITION_OR_SUBTRACTION') return mode === 'subtraction' ? a - b : a + b;
  if (adapterId === 'MULTIPLICATION_OR_DIVISION') return mode === 'division' ? a / b : a * b;
  if (adapterId === 'REMAINDER_DECISION') {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    if (mode === 'ceil') return Math.ceil(a / b);
    if (mode === 'floor') return quotient;
    return { quotient, remainder };
  }
  if (adapterId === 'COMPARISON_OR_ESTIMATION') {
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
  if (adapterId === 'MULTI_STEP_RELATION') {
    if (mode === 'add_then_divide') return (a + c) / b;
    if (mode === 'divide_then_subtract') return a / b - c;
    if (mode === 'subtract_then_divide') return (a - c) / b;
    return a / b + c;
  }
  if (adapterId === 'MEASUREMENT_CONVERSION') return mode === 'divide_factor' ? a / b : a * b;
  if (adapterId === 'DATA_SUMMARY') {
    if (mode === 'sum') return values.reduce((sum, value) => sum + value, 0);
    if (mode === 'difference') return Math.max(...values) - Math.min(...values);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  if (adapterId === 'RESOURCE_PLANNING') {
    if (mode === 'maximum_complete_groups') return Math.floor(a / b);
    if (mode === 'allocation') return { completeGroups: Math.floor(a / b), remainder: a % b };
    return Math.ceil(a / b);
  }
  return null;
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

function emptyPBL() {
  return {
    required: false,
    taskIds: [],
    milestoneIds: [],
    dependencies: [],
    finalTaskId: null,
    finalRequiredMilestoneIds: []
  };
}

function selectAdapter(record, policy, adapterIndex) {
  const operationFamily = policy.adapterPriority.find((family) => (
    record.operationFamilyCandidates.includes(family) && adapterIndex.has(family)
  ));
  if (!operationFamily) return null;
  return { operationFamily, definition: adapterIndex.get(operationFamily) };
}

function numericWitness(candidate, record, model, selection) {
  const inputValues = selection.definition.inputSeedValues;
  const mode = selectMode(selection.operationFamily, model);
  const answerPayload = compute(selection.definition.adapterId, mode, inputValues);
  const roleValues = candidate.roleBindingCandidates.map((row, index) => ({
    mathRoleId: row.mathRoleId,
    value: inputValues[index % inputValues.length],
    unitCandidate: row.unitCandidate,
    isAnswerRole: false
  }));
  roleValues.push({
    mathRoleId: candidate.targetRoleCandidate.mathRoleId,
    value: answerPayload,
    unitCandidate: candidate.targetRoleCandidate.answerUnitCandidate,
    isAnswerRole: true
  });
  return {
    operationFamily: selection.operationFamily,
    fixtureAdapterId: selection.definition.adapterId,
    roleValues,
    answerPayload,
    answerRole: candidate.targetRoleCandidate.mathRoleId,
    answerUnitCandidate: candidate.targetRoleCandidate.answerUnitCandidate,
    calculationWitness: {
      mode,
      inputValues,
      recomputedAnswerPayload: answerPayload,
      relation: model.canonicalExpressions[0],
      calculationPass: true
    },
    assessmentOperationFamilies: record.operationFamilyCandidates
  };
}

function fixtureBase({ candidate, numeric, fixtureId, fixtureType, interpretationEvidence, pblEvidence, expectedValidation, lineage = {} }) {
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

function singleFixtures(candidate, record, model, selection) {
  const numeric = numericWitness(candidate, record, model, selection);
  const suffix = `${safeId(candidate.sourceId)}_${safeId(candidate.knowledgePointId)}_${safeId(candidate.canonicalOperationModelId)}`;
  const required = candidate.applicationMode === 'SINGLE_N_PLUS_1';
  const positive = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w01_fixture_${suffix}_single_positive`,
    fixtureType: 'POSITIVE_SINGLE_APPLICATION',
    interpretationEvidence: {
      required,
      provided: true,
      interpretiveAct: required ? 'A02_INTERPRETIVE_ACT_REQUIRED' : null,
      statement: required
        ? candidate.answerModelCandidate.interpretationStatementCandidate
        : '直接應用題的答案角色與單位已由 A01 candidate 對齊。',
      counterfactualApplied: false
    },
    pblEvidence: emptyPBL(),
    expectedValidation: {
      shouldPass: true,
      expectedErrorCode: null,
      expectedCalculationPass: true,
      expectedInterpretationPass: true,
      expectedPBLPass: true
    }
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
  const wrongUnit = structuredClone(positive);
  wrongUnit.fixtureId = `w01_fixture_${suffix}_unit_mismatch_negative`;
  wrongUnit.fixtureType = 'NEGATIVE_UNIT_MISMATCH';
  wrongUnit.answerUnitCandidate = `${positive.answerUnitCandidate}_MISMATCH`;
  wrongUnit.expectedValidation = {
    shouldPass: false,
    expectedErrorCode: 'ANSWER_UNIT_MISMATCH',
    expectedCalculationPass: true,
    expectedInterpretationPass: true,
    expectedPBLPass: true
  };
  return [positive, wrongRole, wrongUnit];
}

function nPlusOneFixtures(proof, candidate, record, model, selection) {
  const numeric = numericWitness(candidate, record, model, selection);
  const suffix = `${safeId(candidate.sourceId)}_${safeId(candidate.knowledgePointId)}_${safeId(candidate.canonicalOperationModelId)}`;
  const interpretationFail = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w01_fixture_${suffix}_n1_interpretation_fail`,
    fixtureType: 'NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL',
    interpretationEvidence: {
      required: true,
      provided: false,
      interpretiveAct: proof.newInterpretiveAct,
      statement: '',
      counterfactualApplied: false
    },
    pblEvidence: emptyPBL(),
    expectedValidation: {
      shouldPass: false,
      expectedErrorCode: 'INTERPRETATION_WITNESS_MISSING',
      expectedCalculationPass: true,
      expectedInterpretationPass: false,
      expectedPBLPass: true
    },
    lineage: { a02ProofCandidateId: proof.proofCandidateId }
  });
  const counterfactual = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w01_fixture_${suffix}_n1_counterfactual_positive`,
    fixtureType: 'POSITIVE_COUNTERFACTUAL_INTERPRETATION',
    interpretationEvidence: {
      required: true,
      provided: true,
      interpretiveAct: proof.newInterpretiveAct,
      statement: `反事實條件「${proof.counterfactualBlueprint.changedContextCondition}」會改變答案或決策意義。`,
      counterfactualApplied: true
    },
    pblEvidence: emptyPBL(),
    expectedValidation: {
      shouldPass: true,
      expectedErrorCode: null,
      expectedCalculationPass: true,
      expectedInterpretationPass: true,
      expectedPBLPass: true
    },
    lineage: { a02ProofCandidateId: proof.proofCandidateId }
  });
  return [interpretationFail, counterfactual];
}

function pblEvidence(pbl) {
  return {
    required: true,
    taskIds: pbl.taskBlueprints.map((row) => row.taskId),
    milestoneIds: pbl.milestoneBlueprints.map((row) => row.milestoneId),
    dependencies: pbl.taskBlueprints.map((row) => ({ taskId: row.taskId, inputRefs: [...row.inputRefs] })),
    finalTaskId: pbl.finalProductCandidate.finalTaskId,
    finalRequiredMilestoneIds: [...pbl.finalProductCandidate.requiredMilestoneIds]
  };
}

function pblFixtures(pbl, proof, candidate, record, model, selection) {
  const numeric = numericWitness(candidate, record, model, selection);
  const suffix = `${safeId(candidate.sourceId)}_${safeId(candidate.knowledgePointId)}_${safeId(candidate.canonicalOperationModelId)}`;
  const positive = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w01_fixture_${suffix}_pbl_positive`,
    fixtureType: 'POSITIVE_PBL_DEPENDENCY_GRAPH',
    interpretationEvidence: {
      required: true,
      provided: true,
      interpretiveAct: proof.newInterpretiveAct,
      statement: pbl.finalProductCandidate.decisionWitnessCandidate,
      counterfactualApplied: false
    },
    pblEvidence: pblEvidence(pbl),
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
  broken.pblEvidence.dependencies[1].inputRefs = [];
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
  const adapterIndex = new Map(policy.adapterDefinitions.map((row) => [row.operationFamily, row]));
  const assessmentByKey = new Map(a02.a01.assessment.records.map((row) => [keyOf(row.sourceId, row.knowledgePointId), row]));
  const proofByKey = new Map(a02.nPlusOneProofCandidates.map((row) => [keyOf(row.sourceId, row.knowledgePointId), row]));
  const pblByKey = new Map(a02.pblTaskSetCandidates.map((row) => [keyOf(row.sourceId, row.primaryKnowledgePointId), row]));
  const fixtures = [];
  const adapterSelections = new Map();

  for (const candidate of a02.a01.candidates) {
    const key = keyOf(candidate.sourceId, candidate.knowledgePointId);
    const record = assessmentByKey.get(key);
    const model = a02.a01.operationIndexes.operationModels.get(`${key}::${candidate.canonicalOperationModelId}`);
    const selection = record ? selectAdapter(record, policy, adapterIndex) : null;
    if (!record || !model || !selection) continue;
    adapterSelections.set(candidate.bindingCandidateId, selection);
    fixtures.push(...singleFixtures(candidate, record, model, selection));
    const proof = proofByKey.get(key);
    if (proof) fixtures.push(...nPlusOneFixtures(proof, candidate, record, model, selection));
    const pbl = pblByKey.get(key);
    if (proof && pbl) fixtures.push(...pblFixtures(pbl, proof, candidate, record, model, selection));
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

function validatePBL(evidence) {
  if (!evidence.required) return true;
  const tasks = new Set(evidence.taskIds);
  const milestones = new Set(evidence.milestoneIds);
  if (tasks.size < 3 || milestones.size < 2) return false;
  if (!evidence.finalTaskId || !tasks.has(evidence.finalTaskId)) return false;
  if (evidence.finalRequiredMilestoneIds.length < 2) return false;
  if (evidence.finalRequiredMilestoneIds.some((id) => !milestones.has(id))) return false;
  const dependencies = new Map(evidence.dependencies.map((row) => [row.taskId, row.inputRefs]));
  for (const [index, taskId] of evidence.taskIds.entries()) {
    const refs = dependencies.get(taskId);
    if (!refs || (index > 0 && refs.length === 0) || refs.some((id) => !milestones.has(id))) return false;
  }
  const finalRefs = dependencies.get(evidence.finalTaskId) ?? [];
  return evidence.finalRequiredMilestoneIds.every((id) => finalRefs.includes(id));
}

function fail(errorCode, calculationPass = false, interpretationPass = false, pblPass = false) {
  return { pass: false, errorCode, calculationPass, interpretationPass, pblPass };
}

export function validateW01ShadowFixture(materialized, fixture) {
  const candidate = materialized.a02.a01.candidates.find((row) => row.bindingCandidateId === fixture.bindingCandidateId);
  if (!candidate
      || candidate.sourceId !== fixture.sourceId
      || candidate.knowledgePointId !== fixture.knowledgePointId
      || candidate.canonicalOperationModelId !== fixture.canonicalOperationModelId
      || fixture.lineage.a01BindingCandidateId !== candidate.bindingCandidateId) {
    return fail('CANDIDATE_LINEAGE_INVALID');
  }
  if (!deepEqual(contextLineage(candidate), fixture.contextLineage)) return fail('CONTEXT_CHAIN_INVALID');

  const adapter = materialized.adapterIndex.get(fixture.operationFamily);
  const record = materialized.assessmentByKey.get(keyOf(fixture.sourceId, fixture.knowledgePointId));
  if (!adapter
      || adapter.adapterId !== fixture.fixtureAdapterId
      || !record?.operationFamilyCandidates.includes(fixture.operationFamily)) {
    return fail('FIXTURE_ADAPTER_NOT_REGISTERED');
  }

  const expectedRoles = new Set([
    ...candidate.roleBindingCandidates.map((row) => row.mathRoleId),
    candidate.targetRoleCandidate.mathRoleId
  ]);
  const actualRoles = new Set(fixture.roleValues.map((row) => row.mathRoleId));
  if ([...expectedRoles].some((id) => !actualRoles.has(id))) return fail('ROLE_COVERAGE_INCOMPLETE');

  const recomputed = compute(fixture.fixtureAdapterId, fixture.calculationWitness.mode, fixture.calculationWitness.inputValues);
  const calculationPass = deepEqual(recomputed, fixture.answerPayload)
    && deepEqual(recomputed, fixture.calculationWitness.recomputedAnswerPayload)
    && fixture.calculationWitness.calculationPass === true;
  if (!calculationPass) return fail('SHADOW_NUMERIC_WITNESS_INVALID');
  if (fixture.answerRole !== candidate.targetRoleCandidate.mathRoleId) return fail('ANSWER_ROLE_MISMATCH', true, true, true);
  if (fixture.answerUnitCandidate !== candidate.targetRoleCandidate.answerUnitCandidate) return fail('ANSWER_UNIT_MISMATCH', true, true, true);

  const interpretationPass = !fixture.interpretationEvidence.required
    || (fixture.interpretationEvidence.provided && fixture.interpretationEvidence.statement.trim().length > 0);
  if (!interpretationPass) return fail('INTERPRETATION_WITNESS_MISSING', true, false, true);
  if (!validatePBL(fixture.pblEvidence)) return fail('PBL_DEPENDENCY_INVALID', true, true, false);
  if (fixture.productionAdmissionAllowed !== false) return fail('PRODUCTION_ADMISSION_FORBIDDEN', true, true, true);
  return { pass: true, errorCode: null, calculationPass: true, interpretationPass: true, pblPass: true };
}

export function executeW01ValidatorShadowRuntime(materialized) {
  return materialized.fixtures.map((fixture) => {
    const actual = validateW01ShadowFixture(materialized, fixture);
    const expected = fixture.expectedValidation;
    return {
      fixtureId: fixture.fixtureId,
      fixtureType: fixture.fixtureType,
      sourceId: fixture.sourceId,
      knowledgePointId: fixture.knowledgePointId,
      operationFamily: fixture.operationFamily,
      macroContextId: fixture.contextLineage.macroContextId,
      expected,
      actual,
      expectationMatched: actual.pass === expected.shouldPass
        && actual.errorCode === expected.expectedErrorCode
        && actual.calculationPass === expected.expectedCalculationPass
        && actual.interpretationPass === expected.expectedInterpretationPass
        && actual.pblPass === expected.expectedPBLPass
    };
  });
}

export function validateW01ValidatorShadowRuntime(materialized) {
  const issues = [];
  const a02Validation = validateW01NPlusOneAndPBLCandidatePack(materialized.a02);
  if (!a02Validation.ok) issues.push(issue('POSTG_APP_W01_A03_A02_PACK_INVALID', 'a02', { a02Issues: a02Validation.issues }));

  const fixtures = materialized.fixtures;
  const candidates = materialized.a02.a01.candidates;
  const proofs = materialized.a02.nPlusOneProofCandidates;
  const pblRows = materialized.a02.pblTaskSetCandidates;
  const fixtureIds = fixtures.map((row) => row.fixtureId);
  if (new Set(fixtureIds).size !== fixtureIds.length) issues.push(issue('POSTG_APP_W01_A03_FIXTURE_ID_DUPLICATED', 'fixtures'));

  const expectedFixtureCount = candidates.length * 3 + proofs.length * 2 + pblRows.length * 2;
  if (fixtures.length !== expectedFixtureCount) {
    issues.push(issue('POSTG_APP_W01_A03_FIXTURE_COUNT_MISMATCH', 'fixtures', { expected: expectedFixtureCount, actual: fixtures.length }));
  }

  for (const candidate of candidates) {
    const rows = fixtures.filter((row) => row.bindingCandidateId === candidate.bindingCandidateId);
    for (const type of ['POSITIVE_SINGLE_APPLICATION', 'NEGATIVE_WRONG_ANSWER_ROLE', 'NEGATIVE_UNIT_MISMATCH']) {
      if (rows.filter((row) => row.fixtureType === type).length !== 1) {
        issues.push(issue('POSTG_APP_W01_A03_SINGLE_FIXTURE_COVERAGE_INVALID', candidate.bindingCandidateId, { fixtureType: type }));
      }
    }
  }
  for (const proof of proofs) {
    const rows = fixtures.filter((row) => row.lineage.a02ProofCandidateId === proof.proofCandidateId);
    for (const type of ['NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL', 'POSITIVE_COUNTERFACTUAL_INTERPRETATION']) {
      if (rows.filter((row) => row.fixtureType === type).length < 1) {
        issues.push(issue('POSTG_APP_W01_A03_N1_FIXTURE_COVERAGE_INVALID', proof.proofCandidateId, { fixtureType: type }));
      }
    }
  }
  for (const pbl of pblRows) {
    const rows = fixtures.filter((row) => row.lineage.a02PBLCandidateId === pbl.pblCandidateId);
    for (const type of ['POSITIVE_PBL_DEPENDENCY_GRAPH', 'NEGATIVE_PBL_DEPENDENCY_BROKEN']) {
      if (rows.filter((row) => row.fixtureType === type).length !== 1) {
        issues.push(issue('POSTG_APP_W01_A03_PBL_FIXTURE_COVERAGE_INVALID', pbl.pblCandidateId, { fixtureType: type }));
      }
    }
  }

  const runtimeResults = executeW01ValidatorShadowRuntime(materialized);
  for (const result of runtimeResults.filter((row) => !row.expectationMatched)) {
    issues.push(issue('POSTG_APP_W01_A03_FIXTURE_EXPECTATION_MISMATCH', result.fixtureId, { expected: result.expected, actual: result.actual }));
  }

  const positiveResults = runtimeResults.filter((row) => row.expected.shouldPass);
  const negativeResults = runtimeResults.filter((row) => !row.expected.shouldPass);
  const unexpectedPassCount = negativeResults.filter((row) => row.actual.pass).length;
  const unexpectedRejectCount = positiveResults.filter((row) => !row.actual.pass).length;
  const interpretationFailures = runtimeResults.filter((row) => row.fixtureType === 'NEGATIVE_CALCULATION_PASS_INTERPRETATION_FAIL');
  if (!interpretationFailures.every((row) => (
    row.actual.errorCode === 'INTERPRETATION_WITNESS_MISSING'
    && row.actual.calculationPass === true
    && row.actual.interpretationPass === false
  ))) issues.push(issue('POSTG_APP_W01_A03_CALCULATION_PASS_INTERPRETATION_FAIL_GATE_INVALID', 'runtimeResults'));

  const pblFailures = runtimeResults.filter((row) => row.fixtureType === 'NEGATIVE_PBL_DEPENDENCY_BROKEN');
  if (!pblFailures.every((row) => row.actual.errorCode === 'PBL_DEPENDENCY_INVALID')) {
    issues.push(issue('POSTG_APP_W01_A03_PBL_DEPENDENCY_NEGATIVE_GATE_INVALID', 'runtimeResults'));
  }

  const assessmentSourceCoverage = sortedUnique(materialized.a02.a01.assessment.records.map((row) => row.sourceId));
  const eligibleSourceCoverage = sortedUnique(candidates.map((row) => row.sourceId));
  const runtimeSourceCoverage = sortedUnique(fixtures.map((row) => row.sourceId));
  const excludedSourceCoverage = assessmentSourceCoverage.filter((sourceId) => !eligibleSourceCoverage.includes(sourceId));
  const macroCoverage = sortedUnique(fixtures.map((row) => row.contextLineage.macroContextId));

  if (assessmentSourceCoverage.length !== 15) {
    issues.push(issue('POSTG_APP_W01_A03_GOLDEN_ASSESSMENT_UNIT_COVERAGE_INVALID', 'coverage', { actual: assessmentSourceCoverage.length }));
  }
  if (!deepEqual(runtimeSourceCoverage, eligibleSourceCoverage)) {
    issues.push(issue('POSTG_APP_W01_A03_ELIGIBLE_RUNTIME_UNIT_COVERAGE_INVALID', 'coverage', {
      expected: eligibleSourceCoverage,
      actual: runtimeSourceCoverage
    }));
  }
  if (macroCoverage.length !== 16) issues.push(issue('POSTG_APP_W01_A03_MACRO_CONTEXT_COVERAGE_INVALID', 'coverage', { actual: macroCoverage.length }));
  if (fixtures.some((row) => row.productionAdmissionAllowed !== false)) issues.push(issue('POSTG_APP_W01_A03_PRODUCTION_ADMISSION_FORBIDDEN', 'fixtures'));

  const errorCodeCounts = runtimeResults.reduce((counts, row) => {
    const code = row.actual.errorCode ?? 'PASS';
    counts[code] = (counts[code] ?? 0) + 1;
    return counts;
  }, {});
  const operationFamilyCoverage = sortedUnique(fixtures.map((row) => row.operationFamily));
  const answerUnitCandidateCoverage = sortedUnique(fixtures.map((row) => row.answerUnitCandidate));

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
      goldenAssessmentUnitCoverageCount: assessmentSourceCoverage.length,
      applicationRuntimeUnitCoverageCount: runtimeSourceCoverage.length,
      applicationExcludedUnitCount: excludedSourceCoverage.length,
      macroContextCoverageCount: macroCoverage.length,
      operationFamilyCoverageCount: operationFamilyCoverage.length,
      answerUnitCandidateCoverageCount: answerUnitCandidateCoverage.length,
      productionAdmittedCount: fixtures.filter((row) => row.productionAdmissionAllowed === true).length
    },
    errorCodeCounts,
    operationFamilyCoverage,
    macroCoverage,
    assessmentSourceCoverage,
    eligibleSourceCoverage,
    runtimeSourceCoverage,
    excludedSourceCoverage,
    answerUnitCandidateCoverage,
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

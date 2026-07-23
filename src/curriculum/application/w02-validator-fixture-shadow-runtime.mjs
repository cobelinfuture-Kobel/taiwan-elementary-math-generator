import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW02NPlusOneAndPBLCandidatePack,
  validateW02NPlusOneAndPBLCandidatePack
} from './w02-nplusone-pbl-candidate-pack.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w02-validator-fixture-shadow-policy.json';
const INDEX_PATH = 'data/curriculum/application/assessment/w02-validator-fixture-shadow-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
const deepEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const sortedUnique = (values) => [...new Set(values)].sort();
const countBy = (rows, selector) => rows.reduce((counts, row) => {
  const key = selector(row);
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function primaryContextLineage(candidate) {
  return {
    macroContextId: candidate.contextSelection.macroContextId,
    mesoSituationId: candidate.contextSelection.mesoSituationId,
    microScenarioId: candidate.contextSelection.microScenarioId,
    atomicEpisodeId: candidate.contextSelection.atomicEpisodeId,
    surfaceTemplateId: candidate.contextSelection.surfaceTemplateId
  };
}

function selectSurface(chain, contextIndexes) {
  const generated = [...contextIndexes.generatedSurfaces.values()]
    .filter((surface) => surface.atomicEpisodeId === chain.episode.nodeId)
    .sort((left, right) => left.templateId.localeCompare(right.templateId));
  if (generated.length > 0) return generated[0];
  for (const templateId of chain.episode.surfaceTemplateRefs ?? []) {
    const surface = contextIndexes.generatedSurfaces.get(templateId) ?? contextIndexes.legacySurfaces.get(templateId);
    if (surface) return surface;
  }
  return null;
}

function alternateContextLineage(a03, proof) {
  const chain = a03.a02.contextIndexes.episodeChains.get(proof.crossContextProofCandidate.alternateAtomicEpisodeId);
  const surface = chain ? selectSurface(chain, a03.a02.contextIndexes) : null;
  if (!chain || !surface) return null;
  return {
    macroContextId: chain.macro.nodeId,
    mesoSituationId: chain.meso.nodeId,
    microScenarioId: chain.micro.nodeId,
    atomicEpisodeId: chain.episode.nodeId,
    surfaceTemplateId: surface.templateId
  };
}

function selectAdapter(candidate, sourceRow, policy) {
  const definition = policy.adapterDefinitions.find((row) => row.answerShape === candidate.answerModelCandidate.answerShape);
  if (!definition) return null;
  const relation = sourceRow.operationModel.canonicalExpressions[0] ?? '';
  let adapterMode = 'generic';
  if (definition.adapterId === 'GENERIC_QUANTITY_RECONSTRUCTION') {
    if (relation.includes('*') && relation.includes('/')) adapterMode = 'multiply_then_divide';
    else if (relation.includes('/') && relation.includes('+')) adapterMode = 'divide_then_add';
    else if (relation.includes('/')) adapterMode = 'divide';
    else if (relation.includes('*')) adapterMode = 'multiply';
    else if (relation.includes('-')) adapterMode = 'subtract';
    else adapterMode = 'add';
  } else if (definition.adapterId === 'QUOTIENT_REMAINDER_RECONSTRUCTION') {
    adapterMode = 'quotient_remainder';
  } else if (definition.adapterId === 'BOUNDED_DECISION_RECONSTRUCTION') {
    adapterMode = 'bounded_decision';
  } else if (definition.adapterId === 'COMPARISON_CHOICE_RECONSTRUCTION') {
    adapterMode = 'comparison_choice';
  }
  return {
    definition,
    adapterMode,
    operationFamilyId: sourceRow.operationModel.operationFamilyId,
    canonicalRelation: relation
  };
}

function compute(adapterId, mode, values) {
  const [a = 0, b = 1, c = 1] = values;
  if (adapterId === 'GENERIC_QUANTITY_RECONSTRUCTION') {
    if (mode === 'multiply_then_divide') return a * b / c;
    if (mode === 'divide_then_add') return a / b + c;
    if (mode === 'divide') return a / b;
    if (mode === 'multiply') return a * b;
    if (mode === 'subtract') return a - b;
    return a + b;
  }
  if (adapterId === 'QUOTIENT_REMAINDER_RECONSTRUCTION') {
    return { quotient: Math.floor(a / b), remainder: a % b };
  }
  if (adapterId === 'BOUNDED_DECISION_RECONSTRUCTION') {
    const computedTotal = a * b;
    return { computedTotal, bound: c, feasible: computedTotal <= c, difference: Math.abs(c - computedTotal) };
  }
  if (adapterId === 'COMPARISON_CHOICE_RECONSTRUCTION') {
    return { left: a, right: b, relation: a === b ? '=' : a > b ? '>' : '<' };
  }
  return null;
}

function corruptAnswer(answerPayload) {
  if (typeof answerPayload === 'number') return answerPayload + 1;
  if (typeof answerPayload === 'string') return `${answerPayload}_wrong`;
  if (Array.isArray(answerPayload)) return [...answerPayload, '__wrong__'];
  return { ...answerPayload, __wrong__: true };
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

function emptyMisconception() {
  return {
    triggered: false,
    misconceptionId: null,
    misconceptionType: null,
    diagnosticClassification: null
  };
}

function numericWitness(candidate, sourceRow, selection) {
  const inputValues = [...selection.definition.inputSeedValues];
  const answerPayload = compute(selection.definition.adapterId, selection.adapterMode, inputValues);
  const roleValues = candidate.roleBindingCandidates.map((row, index) => ({
    mathRoleId: row.mathRoleId,
    value: inputValues[index % inputValues.length],
    unitCandidate: row.unitCandidate,
    isAnswerRole: false
  }));
  roleValues.push({
    mathRoleId: candidate.targetRoleCandidate.mathRoleId,
    value: structuredClone(answerPayload),
    unitCandidate: candidate.targetRoleCandidate.answerUnitCandidate,
    isAnswerRole: true
  });
  return {
    operationFamilyId: selection.operationFamilyId,
    answerShape: candidate.answerModelCandidate.answerShape,
    fixtureAdapterId: selection.definition.adapterId,
    adapterMode: selection.adapterMode,
    roleValues,
    answerPayload,
    answerRole: candidate.targetRoleCandidate.mathRoleId,
    answerUnitCandidate: candidate.targetRoleCandidate.answerUnitCandidate,
    calculationWitness: {
      inputValues,
      recomputedAnswerPayload: structuredClone(answerPayload),
      canonicalRelation: selection.canonicalRelation,
      calculationPass: true
    }
  };
}

function fixtureBase({
  candidate,
  numeric,
  fixtureId,
  fixtureType,
  contextMode = 'PRIMARY',
  contextLineage = primaryContextLineage(candidate),
  baseFixtureId = null,
  proof = null,
  pbl = null,
  interpretationEvidence,
  misconceptionEvidence = emptyMisconception(),
  uniquenessEvidence = { answerCardinality: 1, witnessCardinality: 1 },
  pblEvidence = emptyPBL(),
  expectedValidation
}) {
  return {
    schemaVersion: 1,
    fixtureId,
    fixtureType,
    sourceId: candidate.sourceId,
    sourceContentIdentityGroup: candidate.sourceContentIdentityGroup,
    patternSpecId: candidate.patternSpecId,
    knowledgePointId: candidate.knowledgePointId,
    canonicalOperationModelId: candidate.canonicalOperationModelId,
    bindingCandidateId: candidate.bindingCandidateId,
    operationFamilyId: numeric.operationFamilyId,
    answerShape: numeric.answerShape,
    fixtureAdapterId: numeric.fixtureAdapterId,
    adapterMode: numeric.adapterMode,
    contextMode,
    contextLineage,
    roleValues: structuredClone(numeric.roleValues),
    answerPayload: structuredClone(numeric.answerPayload),
    answerRole: numeric.answerRole,
    answerUnitCandidate: numeric.answerUnitCandidate,
    calculationWitness: structuredClone(numeric.calculationWitness),
    pairingEvidence: {
      pairKey: `w02_pair_${safeId(candidate.patternSpecId)}`,
      baseFixtureId,
      sameNumericPrerequisites: true,
      sameNumberDomain: true,
      semanticDeltaOnly: Boolean(proof)
    },
    interpretationEvidence,
    misconceptionEvidence,
    uniquenessEvidence,
    pblEvidence,
    expectedValidation,
    productionAdmissionAllowed: false,
    lineage: {
      a02BindingCandidateId: candidate.bindingCandidateId,
      a03ProofCandidateId: proof?.proofCandidateId ?? null,
      a03PBLCandidateId: pbl?.pblCandidateId ?? null,
      a04PolicyPath: POLICY_PATH
    }
  };
}

function positiveExpected() {
  return {
    shouldPass: true,
    expectedErrorCode: null,
    expectedCalculationPass: true,
    expectedInterpretationPass: true,
    expectedUniquenessPass: true,
    expectedPBLPass: true
  };
}

function negativeExpected(errorCode, {
  calculationPass = true,
  interpretationPass = true,
  uniquenessPass = true,
  pblPass = true
} = {}) {
  return {
    shouldPass: false,
    expectedErrorCode: errorCode,
    expectedCalculationPass: calculationPass,
    expectedInterpretationPass: interpretationPass,
    expectedUniquenessPass: uniquenessPass,
    expectedPBLPass: pblPass
  };
}

function singleFixtures(candidate, sourceRow, selection) {
  const numeric = numericWitness(candidate, sourceRow, selection);
  const suffix = safeId(candidate.patternSpecId);
  const baseFixtureId = `w02_fixture_${suffix}_single_positive`;
  const positive = fixtureBase({
    candidate,
    numeric,
    fixtureId: baseFixtureId,
    fixtureType: 'POSITIVE_SINGLE_APPLICATION',
    interpretationEvidence: {
      required: false,
      provided: true,
      interpretiveAct: null,
      statement: candidate.answerModelCandidate.interpretationStatementCandidate,
      counterfactualApplied: false,
      crossContextApplied: false
    },
    expectedValidation: positiveExpected()
  });
  const wrongRole = structuredClone(positive);
  wrongRole.fixtureId = `w02_fixture_${suffix}_wrong_role_negative`;
  wrongRole.fixtureType = 'NEGATIVE_WRONG_ANSWER_ROLE';
  wrongRole.answerRole = `${positive.answerRole}_wrong`;
  wrongRole.expectedValidation = negativeExpected('ANSWER_ROLE_MISMATCH');
  const wrongUnit = structuredClone(positive);
  wrongUnit.fixtureId = `w02_fixture_${suffix}_unit_mismatch_negative`;
  wrongUnit.fixtureType = 'NEGATIVE_UNIT_MISMATCH';
  wrongUnit.answerUnitCandidate = `${positive.answerUnitCandidate}_MISMATCH`;
  wrongUnit.expectedValidation = negativeExpected('ANSWER_UNIT_MISMATCH');
  return { numeric, baseFixtureId, fixtures: [positive, wrongRole, wrongUnit] };
}

function proofFixtures({ a03, candidate, proof, numeric, baseFixtureId, policy }) {
  const suffix = safeId(candidate.patternSpecId);
  const commonInterpretation = {
    required: true,
    provided: true,
    interpretiveAct: proof.newInterpretiveAct,
    statement: proof.interpretationWitnessBlueprint.expectedEvidenceCandidate,
    counterfactualApplied: false,
    crossContextApplied: false
  };
  const nPlusOnePositive = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w02_fixture_${suffix}_n1_positive`,
    fixtureType: 'POSITIVE_N_PLUS_ONE_INTERPRETATION',
    baseFixtureId,
    proof,
    interpretationEvidence: commonInterpretation,
    expectedValidation: positiveExpected()
  });
  const misconceptionFixtures = proof.misconceptionCandidates.map((misconception, index) => {
    const calculationFail = misconception.diagnosticClassification === 'CALCULATION_FAIL';
    const errorCode = policy.misconceptionErrorCodeByType[misconception.misconceptionType];
    const fixture = fixtureBase({
      candidate,
      numeric,
      fixtureId: `w02_fixture_${suffix}_misconception_${index + 1}`,
      fixtureType: 'NEGATIVE_MISCONCEPTION',
      baseFixtureId,
      proof,
      interpretationEvidence: {
        ...commonInterpretation,
        provided: calculationFail,
        statement: calculationFail ? misconception.expectedWrongDecisionCandidate : ''
      },
      misconceptionEvidence: {
        triggered: true,
        misconceptionId: misconception.misconceptionId,
        misconceptionType: misconception.misconceptionType,
        diagnosticClassification: misconception.diagnosticClassification
      },
      expectedValidation: negativeExpected(errorCode, {
        calculationPass: !calculationFail,
        interpretationPass: false
      })
    });
    if (calculationFail) fixture.answerPayload = corruptAnswer(fixture.answerPayload);
    return fixture;
  });
  const counterfactual = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w02_fixture_${suffix}_counterfactual_positive`,
    fixtureType: 'POSITIVE_COUNTERFACTUAL_INTERPRETATION',
    baseFixtureId,
    proof,
    interpretationEvidence: {
      ...commonInterpretation,
      statement: `反事實條件「${proof.counterfactualBlueprint.changedContextCondition}」已改變答案或決策意義。`,
      counterfactualApplied: true
    },
    expectedValidation: positiveExpected()
  });
  const alternate = alternateContextLineage(a03, proof);
  const crossContext = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w02_fixture_${suffix}_cross_context_positive`,
    fixtureType: 'POSITIVE_CROSS_CONTEXT_INTERPRETATION',
    contextMode: 'ALTERNATE',
    contextLineage: alternate,
    baseFixtureId,
    proof,
    interpretationEvidence: {
      ...commonInterpretation,
      statement: `相同 PatternSpec 與運算模型已投影至 ${alternate?.macroContextId ?? 'missing'}，interpretive act 保持不變。`,
      crossContextApplied: true
    },
    expectedValidation: positiveExpected()
  });
  const nonUnique = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w02_fixture_${suffix}_non_unique_negative`,
    fixtureType: 'NEGATIVE_NON_UNIQUE_ANSWER_WITNESS',
    baseFixtureId,
    proof,
    interpretationEvidence: commonInterpretation,
    uniquenessEvidence: { answerCardinality: 2, witnessCardinality: 1 },
    expectedValidation: negativeExpected('ANSWER_NOT_UNIQUE', { uniquenessPass: false })
  });
  return [nPlusOnePositive, ...misconceptionFixtures, counterfactual, crossContext, nonUnique];
}

function buildPBLEvidence(pbl) {
  return {
    required: true,
    taskIds: pbl.taskBlueprints.map((row) => row.taskId),
    milestoneIds: pbl.milestoneBlueprints.map((row) => row.milestoneId),
    dependencies: pbl.taskBlueprints.map((row) => ({ taskId: row.taskId, inputRefs: [...row.inputRefs] })),
    finalTaskId: pbl.finalProductCandidate.finalTaskId,
    finalRequiredMilestoneIds: [...pbl.finalProductCandidate.requiredMilestoneIds]
  };
}

function pblFixtures({ candidate, proof, pbl, numeric, baseFixtureId }) {
  const suffix = safeId(candidate.patternSpecId);
  const positive = fixtureBase({
    candidate,
    numeric,
    fixtureId: `w02_fixture_${suffix}_pbl_positive`,
    fixtureType: 'POSITIVE_PBL_DEPENDENCY_GRAPH',
    baseFixtureId,
    proof,
    pbl,
    interpretationEvidence: {
      required: true,
      provided: true,
      interpretiveAct: proof.newInterpretiveAct,
      statement: pbl.finalProductCandidate.decisionWitnessCandidate,
      counterfactualApplied: false,
      crossContextApplied: false
    },
    pblEvidence: buildPBLEvidence(pbl),
    expectedValidation: positiveExpected()
  });
  const broken = structuredClone(positive);
  broken.fixtureId = `w02_fixture_${suffix}_pbl_dependency_broken`;
  broken.fixtureType = 'NEGATIVE_PBL_DEPENDENCY_BROKEN';
  broken.pblEvidence.dependencies[1].inputRefs = [];
  broken.expectedValidation = negativeExpected('PBL_DEPENDENCY_INVALID', { pblPass: false });
  return [positive, broken];
}

export function materializeW02ValidatorShadowFixtures({ root = process.cwd() } = {}) {
  const a03 = materializeW02NPlusOneAndPBLCandidatePack({ root });
  const policy = readJson(root, POLICY_PATH);
  const index = readJson(root, INDEX_PATH);
  const fixtures = [];
  const adapterSelections = new Map();
  const pblByPatternSpecId = new Map(a03.pblTaskSetCandidates.map((row) => [row.patternSpecId, row]));

  for (const candidate of a03.a02.candidates) {
    const sourceRow = a03.sourceRowByPatternSpecId.get(candidate.patternSpecId);
    const selection = sourceRow ? selectAdapter(candidate, sourceRow, policy) : null;
    if (!sourceRow || !selection) continue;
    adapterSelections.set(candidate.patternSpecId, selection);
    const single = singleFixtures(candidate, sourceRow, selection);
    fixtures.push(...single.fixtures);
    const proof = a03.proofByPatternSpecId.get(candidate.patternSpecId);
    if (proof) {
      fixtures.push(...proofFixtures({
        a03,
        candidate,
        proof,
        numeric: single.numeric,
        baseFixtureId: single.baseFixtureId,
        policy
      }));
      const pbl = pblByPatternSpecId.get(candidate.patternSpecId);
      if (pbl) fixtures.push(...pblFixtures({
        candidate,
        proof,
        pbl,
        numeric: single.numeric,
        baseFixtureId: single.baseFixtureId
      }));
    }
  }

  return {
    root,
    a03,
    policy,
    index,
    adapterSelections,
    pblByPatternSpecId,
    fixtures
  };
}

function validatePBL(evidence) {
  if (!evidence.required) return true;
  const tasks = new Set(evidence.taskIds);
  const milestones = new Set(evidence.milestoneIds);
  if (tasks.size < 3 || milestones.size < 3) return false;
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

function fail(errorCode, {
  calculationPass = false,
  interpretationPass = false,
  uniquenessPass = false,
  pblPass = false
} = {}) {
  return { pass: false, errorCode, calculationPass, interpretationPass, uniquenessPass, pblPass };
}

function validateContext(materialized, candidate, proof, fixture) {
  if (fixture.contextMode === 'PRIMARY') return deepEqual(primaryContextLineage(candidate), fixture.contextLineage);
  if (!proof) return false;
  const alternate = alternateContextLineage(materialized.a03, proof);
  return Boolean(
    alternate
    && deepEqual(alternate, fixture.contextLineage)
    && alternate.macroContextId !== candidate.contextSelection.macroContextId
    && fixture.interpretationEvidence.crossContextApplied === true
  );
}

export function validateW02ShadowFixture(materialized, fixture) {
  const candidate = materialized.a03.candidateByPatternSpecId.get(fixture.patternSpecId);
  const proof = materialized.a03.proofByPatternSpecId.get(fixture.patternSpecId) ?? null;
  const pbl = materialized.pblByPatternSpecId.get(fixture.patternSpecId) ?? null;
  const expectedProofCandidateId = fixture.pairingEvidence.baseFixtureId
  ? proof?.proofCandidateId ?? null
  : null;
const expectedPBLCandidateId = fixture.pblEvidence.required
  ? pbl?.pblCandidateId ?? null
  : null;
  if (!candidate
      || candidate.bindingCandidateId !== fixture.bindingCandidateId
      || candidate.sourceId !== fixture.sourceId
      || candidate.sourceContentIdentityGroup !== fixture.sourceContentIdentityGroup
      || candidate.knowledgePointId !== fixture.knowledgePointId
      || candidate.canonicalOperationModelId !== fixture.canonicalOperationModelId
      || fixture.lineage.a02BindingCandidateId !== candidate.bindingCandidateId
      || fixture.lineage.a03ProofCandidateId !== expectedProofCandidateId
      || fixture.lineage.a03PBLCandidateId !== expectedPBLCandidateId) {
    return fail('CANDIDATE_LINEAGE_INVALID');
  }
  if (!validateContext(materialized, candidate, proof, fixture)) return fail('CONTEXT_CHAIN_INVALID');

  const selection = materialized.adapterSelections.get(candidate.patternSpecId);
  if (!selection
      || selection.definition.adapterId !== fixture.fixtureAdapterId
      || selection.operationFamilyId !== fixture.operationFamilyId
      || candidate.answerModelCandidate.answerShape !== fixture.answerShape) {
    return fail('FIXTURE_ADAPTER_NOT_REGISTERED');
  }

  const expectedRoles = new Set([
    ...candidate.roleBindingCandidates.map((row) => row.mathRoleId),
    candidate.targetRoleCandidate.mathRoleId
  ]);
  const actualRoles = new Set(fixture.roleValues.map((row) => row.mathRoleId));
  if ([...expectedRoles].some((roleId) => !actualRoles.has(roleId))) return fail('ROLE_COVERAGE_INCOMPLETE');

  const recomputed = compute(fixture.fixtureAdapterId, fixture.adapterMode, fixture.calculationWitness.inputValues);
  const calculationPass = deepEqual(recomputed, fixture.answerPayload)
    && deepEqual(recomputed, fixture.calculationWitness.recomputedAnswerPayload)
    && fixture.calculationWitness.calculationPass === true;

  if (fixture.misconceptionEvidence.triggered) {
    const misconception = proof?.misconceptionCandidates.find((row) => row.misconceptionId === fixture.misconceptionEvidence.misconceptionId);
    if (!misconception
        || misconception.misconceptionType !== fixture.misconceptionEvidence.misconceptionType
        || misconception.diagnosticClassification !== fixture.misconceptionEvidence.diagnosticClassification) {
      return fail('CANDIDATE_LINEAGE_INVALID');
    }
    const errorCode = materialized.policy.misconceptionErrorCodeByType[misconception.misconceptionType];
    if (misconception.diagnosticClassification === 'CALCULATION_FAIL') {
      if (calculationPass) return fail('MISCONCEPTION_FIXTURE_INVALID');
      return fail(errorCode, { calculationPass: false, interpretationPass: false, uniquenessPass: true, pblPass: true });
    }
    if (!calculationPass) return fail('SHADOW_NUMERIC_WITNESS_INVALID');
    return fail(errorCode, { calculationPass: true, interpretationPass: false, uniquenessPass: true, pblPass: true });
  }

  if (!calculationPass) return fail('SHADOW_NUMERIC_WITNESS_INVALID');
  if (fixture.answerRole !== candidate.targetRoleCandidate.mathRoleId) {
    return fail('ANSWER_ROLE_MISMATCH', { calculationPass: true, interpretationPass: true, uniquenessPass: true, pblPass: true });
  }
  if (fixture.answerUnitCandidate !== candidate.targetRoleCandidate.answerUnitCandidate) {
    return fail('ANSWER_UNIT_MISMATCH', { calculationPass: true, interpretationPass: true, uniquenessPass: true, pblPass: true });
  }

  if (fixture.pairingEvidence.baseFixtureId) {
    const base = materialized.fixtures.find((row) => row.fixtureId === fixture.pairingEvidence.baseFixtureId);
    if (!base
        || fixture.pairingEvidence.sameNumericPrerequisites !== true
        || fixture.pairingEvidence.sameNumberDomain !== true
        || fixture.pairingEvidence.semanticDeltaOnly !== true
        || !deepEqual(base.calculationWitness.inputValues, fixture.calculationWitness.inputValues)
        || !deepEqual(base.answerPayload, fixture.answerPayload)) {
      return fail('N_PLUS_ONE_PAIRING_INVALID', { calculationPass: true });
    }
  }

  const interpretationPass = !fixture.interpretationEvidence.required
    || (fixture.interpretationEvidence.provided && fixture.interpretationEvidence.statement.trim().length > 0);
  if (!interpretationPass) {
    return fail('INTERPRETATION_WITNESS_MISSING', { calculationPass: true, interpretationPass: false, uniquenessPass: true, pblPass: true });
  }
  if (fixture.fixtureType === 'POSITIVE_COUNTERFACTUAL_INTERPRETATION'
      && fixture.interpretationEvidence.counterfactualApplied !== true) {
    return fail('COUNTERFACTUAL_INTERPRETATION_INVALID', { calculationPass: true });
  }
  if (fixture.fixtureType === 'POSITIVE_CROSS_CONTEXT_INTERPRETATION'
      && fixture.interpretationEvidence.crossContextApplied !== true) {
    return fail('CROSS_CONTEXT_EQUIVALENCE_INVALID', { calculationPass: true });
  }

  const uniquenessPass = fixture.uniquenessEvidence.answerCardinality === 1
    && fixture.uniquenessEvidence.witnessCardinality === 1;
  if (!uniquenessPass) {
    return fail('ANSWER_NOT_UNIQUE', { calculationPass: true, interpretationPass: true, uniquenessPass: false, pblPass: true });
  }
  if (!validatePBL(fixture.pblEvidence)) {
    return fail('PBL_DEPENDENCY_INVALID', { calculationPass: true, interpretationPass: true, uniquenessPass: true, pblPass: false });
  }
  if (fixture.productionAdmissionAllowed !== false) {
    return fail('PRODUCTION_ADMISSION_FORBIDDEN', { calculationPass: true, interpretationPass: true, uniquenessPass: true, pblPass: true });
  }
  return {
    pass: true,
    errorCode: null,
    calculationPass: true,
    interpretationPass: true,
    uniquenessPass: true,
    pblPass: true
  };
}

export function executeW02ValidatorShadowRuntime(materialized) {
  return materialized.fixtures.map((fixture) => {
    const actual = validateW02ShadowFixture(materialized, fixture);
    const expected = fixture.expectedValidation;
    return {
      fixtureId: fixture.fixtureId,
      fixtureType: fixture.fixtureType,
      sourceId: fixture.sourceId,
      sourceContentIdentityGroup: fixture.sourceContentIdentityGroup,
      patternSpecId: fixture.patternSpecId,
      operationFamilyId: fixture.operationFamilyId,
      answerShape: fixture.answerShape,
      contextMode: fixture.contextMode,
      macroContextId: fixture.contextLineage.macroContextId,
      misconceptionType: fixture.misconceptionEvidence.misconceptionType,
      expected,
      actual,
      expectationMatched: actual.pass === expected.shouldPass
        && actual.errorCode === expected.expectedErrorCode
        && actual.calculationPass === expected.expectedCalculationPass
        && actual.interpretationPass === expected.expectedInterpretationPass
        && actual.uniquenessPass === expected.expectedUniquenessPass
        && actual.pblPass === expected.expectedPBLPass
    };
  });
}

function duplicateParity(materialized) {
  const byContent = new Map();
  for (const fixture of materialized.fixtures) {
    if (!byContent.has(fixture.sourceContentIdentityGroup)) byContent.set(fixture.sourceContentIdentityGroup, new Map());
    const bySource = byContent.get(fixture.sourceContentIdentityGroup);
    if (!bySource.has(fixture.sourceId)) bySource.set(fixture.sourceId, []);
    bySource.get(fixture.sourceId).push(fixture);
  }
  const comparisons = [];
  for (const [contentIdentityGroup, bySource] of byContent) {
    if (bySource.size < 2) continue;
    const normalized = [...bySource.entries()].map(([sourceId, rows]) => ({
      sourceId,
      projections: rows.map((row) => ({
        key: [
          materialized.a03.candidateByPatternSpecId.get(row.patternSpecId)?.lineage.duplicateProjectionKey ?? row.patternSpecId,
          row.fixtureType,
          row.misconceptionEvidence.misconceptionType ?? 'none'
        ].join('::'),
        fixtureType: row.fixtureType,
        adapterId: row.fixtureAdapterId,
        adapterMode: row.adapterMode,
        contextMode: row.contextMode,
        macroContextId: row.contextLineage.macroContextId,
        expectedErrorCode: row.expectedValidation.expectedErrorCode
      })).sort((left, right) => left.key.localeCompare(right.key))
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

export function validateW02ValidatorShadowRuntime(materialized) {
  const issues = [];
  const a03Validation = validateW02NPlusOneAndPBLCandidatePack(materialized.a03);
  if (!a03Validation.ok) issues.push(issue('POSTG_APP_W02_A04_A03_PACK_INVALID', 'a03', { a03Issues: a03Validation.issues }));

  const candidates = materialized.a03.a02.candidates;
  const proofs = materialized.a03.nPlusOneProofCandidates;
  const pblRows = materialized.a03.pblTaskSetCandidates;
  const fixtures = materialized.fixtures;
  if (new Set(fixtures.map((row) => row.fixtureId)).size !== fixtures.length) {
    issues.push(issue('POSTG_APP_W02_A04_FIXTURE_ID_DUPLICATED', 'fixtures'));
  }
  const expectedFixtureCount = candidates.length * 3 + proofs.length * 7 + pblRows.length * 2;
  if (fixtures.length !== expectedFixtureCount || fixtures.length !== 672) {
    issues.push(issue('POSTG_APP_W02_A04_FIXTURE_COUNT_MISMATCH', 'fixtures', { expected: expectedFixtureCount, actual: fixtures.length }));
  }

  for (const candidate of candidates) {
    const rows = fixtures.filter((row) => row.patternSpecId === candidate.patternSpecId);
    for (const fixtureType of ['POSITIVE_SINGLE_APPLICATION', 'NEGATIVE_WRONG_ANSWER_ROLE', 'NEGATIVE_UNIT_MISMATCH']) {
      if (rows.filter((row) => row.fixtureType === fixtureType).length !== 1) {
        issues.push(issue('POSTG_APP_W02_A04_SINGLE_FIXTURE_COVERAGE_INVALID', candidate.patternSpecId, { fixtureType }));
      }
    }
  }
  for (const proof of proofs) {
    const rows = fixtures.filter((row) => row.lineage.a03ProofCandidateId === proof.proofCandidateId);
    for (const fixtureType of [
      'POSITIVE_N_PLUS_ONE_INTERPRETATION',
      'POSITIVE_COUNTERFACTUAL_INTERPRETATION',
      'POSITIVE_CROSS_CONTEXT_INTERPRETATION',
      'NEGATIVE_NON_UNIQUE_ANSWER_WITNESS'
    ]) {
      if (rows.filter((row) => row.fixtureType === fixtureType).length !== 1) {
        issues.push(issue('POSTG_APP_W02_A04_PROOF_FIXTURE_COVERAGE_INVALID', proof.proofCandidateId, { fixtureType }));
      }
    }
    const misconceptionRows = rows.filter((row) => row.fixtureType === 'NEGATIVE_MISCONCEPTION');
    if (misconceptionRows.length !== 3
        || sortedUnique(misconceptionRows.map((row) => row.misconceptionEvidence.misconceptionId)).length !== 3) {
      issues.push(issue('POSTG_APP_W02_A04_MISCONCEPTION_FIXTURE_COVERAGE_INVALID', proof.proofCandidateId));
    }
  }
  for (const pbl of pblRows) {
    const rows = fixtures.filter((row) => row.lineage.a03PBLCandidateId === pbl.pblCandidateId);
    for (const fixtureType of ['POSITIVE_PBL_DEPENDENCY_GRAPH', 'NEGATIVE_PBL_DEPENDENCY_BROKEN']) {
      if (rows.filter((row) => row.fixtureType === fixtureType).length !== 1) {
        issues.push(issue('POSTG_APP_W02_A04_PBL_FIXTURE_COVERAGE_INVALID', pbl.pblCandidateId, { fixtureType }));
      }
    }
  }

  const runtimeResults = executeW02ValidatorShadowRuntime(materialized);
  for (const result of runtimeResults.filter((row) => !row.expectationMatched)) {
    issues.push(issue('POSTG_APP_W02_A04_FIXTURE_EXPECTATION_MISMATCH', result.fixtureId, { expected: result.expected, actual: result.actual }));
  }
  const positiveResults = runtimeResults.filter((row) => row.expected.shouldPass);
  const negativeResults = runtimeResults.filter((row) => !row.expected.shouldPass);
  const unexpectedPassCount = negativeResults.filter((row) => row.actual.pass).length;
  const unexpectedRejectCount = positiveResults.filter((row) => !row.actual.pass).length;

  const misconceptionResults = runtimeResults.filter((row) => row.fixtureType === 'NEGATIVE_MISCONCEPTION');
  if (misconceptionResults.length !== 183
      || misconceptionResults.some((row) => row.actual.pass || !row.actual.errorCode)) {
    issues.push(issue('POSTG_APP_W02_A04_MISCONCEPTION_EXECUTION_INVALID', 'runtimeResults'));
  }
  const calculationPassInterpretationFailResults = misconceptionResults.filter((row) => (
    row.actual.calculationPass === true && row.actual.interpretationPass === false
  ));
  if (calculationPassInterpretationFailResults.length !== 122) {
    issues.push(issue('POSTG_APP_W02_A04_CALCULATION_PASS_INTERPRETATION_FAIL_COUNT_INVALID', 'runtimeResults', {
      expected: 122,
      actual: calculationPassInterpretationFailResults.length
    }));
  }

  const primarySourceCoverage = sortedUnique(fixtures.filter((row) => row.contextMode === 'PRIMARY').map((row) => row.sourceId));
  const primaryMacroCoverage = sortedUnique(fixtures.filter((row) => row.contextMode === 'PRIMARY').map((row) => row.contextLineage.macroContextId));
  const alternateMacroCoverage = sortedUnique(fixtures.filter((row) => row.contextMode === 'ALTERNATE').map((row) => row.contextLineage.macroContextId));
  if (primarySourceCoverage.length !== 13) issues.push(issue('POSTG_APP_W02_A04_SOURCE_COVERAGE_INVALID', 'coverage', { actual: primarySourceCoverage.length }));
  if (primaryMacroCoverage.length !== 16) issues.push(issue('POSTG_APP_W02_A04_PRIMARY_MACRO_COVERAGE_INVALID', 'coverage', { actual: primaryMacroCoverage.length }));
  if (fixtures.filter((row) => row.fixtureType === 'POSITIVE_CROSS_CONTEXT_INTERPRETATION').length !== 61) {
    issues.push(issue('POSTG_APP_W02_A04_CROSS_CONTEXT_EXECUTION_COUNT_INVALID', 'coverage'));
  }

  const duplicateComparisons = duplicateParity(materialized);
  if (duplicateComparisons.length !== 1 || duplicateComparisons.some((row) => !row.equal)) {
    issues.push(issue('POSTG_APP_W02_A04_DUPLICATE_FIXTURE_PROJECTION_INVALID', 'pdf_5ba57aff6a97', { duplicateComparisons }));
  }
  if (fixtures.some((row) => row.productionAdmissionAllowed !== false)) {
    issues.push(issue('POSTG_APP_W02_A04_PRODUCTION_ADMISSION_FORBIDDEN', 'fixtures'));
  }

  const errorCodeCounts = countBy(runtimeResults, (row) => row.actual.errorCode ?? 'PASS');
  const fixtureTypeCounts = countBy(fixtures, (row) => row.fixtureType);
  const operationFamilyCoverage = sortedUnique(fixtures.map((row) => row.operationFamilyId));
  const answerShapeCoverage = sortedUnique(fixtures.map((row) => row.answerShape));
  const adapterCoverage = sortedUnique(fixtures.map((row) => row.fixtureAdapterId));

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      candidateCount: candidates.length,
      nPlusOneProofCount: proofs.length,
      misconceptionCandidateCount: proofs.reduce((sum, row) => sum + row.misconceptionCandidates.length, 0),
      pblCandidateCount: pblRows.length,
      fixtureCount: fixtures.length,
      positiveFixtureCount: positiveResults.length,
      negativeFixtureCount: negativeResults.length,
      passCount: runtimeResults.filter((row) => row.actual.pass).length,
      expectedRejectCount: negativeResults.filter((row) => !row.actual.pass).length,
      unexpectedPassCount,
      unexpectedRejectCount,
      pairedNPlusOneExecutionCount: fixtureTypeCounts.POSITIVE_N_PLUS_ONE_INTERPRETATION ?? 0,
      misconceptionExecutionCount: fixtureTypeCounts.NEGATIVE_MISCONCEPTION ?? 0,
      calculationPassInterpretationFailCount: calculationPassInterpretationFailResults.length,
      counterfactualExecutionCount: fixtureTypeCounts.POSITIVE_COUNTERFACTUAL_INTERPRETATION ?? 0,
      crossContextExecutionCount: fixtureTypeCounts.POSITIVE_CROSS_CONTEXT_INTERPRETATION ?? 0,
      uniquenessNegativeExecutionCount: fixtureTypeCounts.NEGATIVE_NON_UNIQUE_ANSWER_WITNESS ?? 0,
      pblDependencyExecutionCount: (fixtureTypeCounts.POSITIVE_PBL_DEPENDENCY_GRAPH ?? 0) + (fixtureTypeCounts.NEGATIVE_PBL_DEPENDENCY_BROKEN ?? 0),
      sourceNodeCoverageCount: primarySourceCoverage.length,
      primaryMacroContextCoverageCount: primaryMacroCoverage.length,
      alternateMacroContextCoverageCount: alternateMacroCoverage.length,
      operationFamilyCoverageCount: operationFamilyCoverage.length,
      answerShapeCoverageCount: answerShapeCoverage.length,
      adapterCoverageCount: adapterCoverage.length,
      duplicateFixtureProjectionGroupCount: duplicateComparisons.length,
      productionAdmittedCount: fixtures.filter((row) => row.productionAdmissionAllowed === true).length
    },
    fixtureTypeCounts,
    errorCodeCounts,
    operationFamilyCoverage,
    answerShapeCoverage,
    adapterCoverage,
    primarySourceCoverage,
    primaryMacroCoverage,
    alternateMacroCoverage,
    duplicateComparisons,
    runtimeResults,
    nextShortestStep: materialized.index.nextShortestStep,
    status: issues.length === 0
      ? 'W02_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_PASS'
      : 'W02_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_BLOCKED'
  };
}

export function buildW02ValidatorShadowReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW02ValidatorShadowFixtures({ root });
  const validation = validateW02ValidatorShadowRuntime(materialized);
  const sample = (fixtureType) => validation.runtimeResults.find((row) => row.fixtureType === fixtureType) ?? null;
  return {
    ...validation,
    programId: materialized.index.programId,
    taskId: materialized.index.taskId,
    sampleResults: {
      positiveSingle: sample('POSITIVE_SINGLE_APPLICATION'),
      wrongRole: sample('NEGATIVE_WRONG_ANSWER_ROLE'),
      unitMismatch: sample('NEGATIVE_UNIT_MISMATCH'),
      nPlusOnePositive: sample('POSITIVE_N_PLUS_ONE_INTERPRETATION'),
      misconception: sample('NEGATIVE_MISCONCEPTION'),
      counterfactual: sample('POSITIVE_COUNTERFACTUAL_INTERPRETATION'),
      crossContext: sample('POSITIVE_CROSS_CONTEXT_INTERPRETATION'),
      nonUnique: sample('NEGATIVE_NON_UNIQUE_ANSWER_WITNESS'),
      pblPositive: sample('POSITIVE_PBL_DEPENDENCY_GRAPH'),
      pblBroken: sample('NEGATIVE_PBL_DEPENDENCY_BROKEN')
    }
  };
}

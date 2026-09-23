import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
);

const APPLICATION_KP = 'kp_g5b_u04_decimal_multiplication_application';
const ESTIMATION_KP = 'kp_g5b_u04_decimal_multiplication_estimation';
const REQUIRED_CAPABILITIES = [
  'cap_decimal_arithmetic',
  'cap_decimal_domain_validator',
  'cap_decimal_number_system'
];

const authority = readJson(
  'data/curriculum/full-product/p03f/slice049-g5b-u04-rank11-application-estimation-authority.json'
);
const reconciliation = readJson(
  'data/curriculum/full-product/p03f/slice049-g5b-u04-queue-allocation-reconciliation.json'
);
const q045 = readJson(
  'data/curriculum/full-product/p03f/slice045-g5b-u04-rank10-decimal-times-decimal-authority.json'
);
const sourceResolution = readJson(
  'data/curriculum/full-product/p03f/slice049-g5b-u04-direct-source-witness-resolution.json'
);

test('P03F49 authority freeze preserves exact frozen allocation and predecessor chain', () => {
  assert.equal(authority.status, 'AUTHORITY_FROZEN_IMPLEMENTATION_ELIGIBLE');
  assert.equal(authority.goalDistanceBefore, 'D3');
  assert.equal(authority.goalDistanceAfter, 'D2');
  assert.equal(authority.queueAuthority.queuePosition, 49);
  assert.equal(authority.queueAuthority.sliceId, 'p03e_q049_r11_g5b_u04_5b04_profile_decimal_c1');
  assert.deepEqual(authority.queueAuthority.frozenKnowledgePointIds, [APPLICATION_KP, ESTIMATION_KP]);
  assert.deepEqual(authority.queueAuthority.frozenKnowledgePointIds, reconciliation.frozenQueue.knowledgePointIds);
  assert.deepEqual(q045.futureQueueBoundary.futureKnowledgePointIds, [APPLICATION_KP, ESTIMATION_KP]);
  assert.equal(q045.futureQueueBoundary.applicationQueuePosition, 49);
  assert.equal(q045.futureQueueBoundary.estimationQueuePosition, 49);
  assert.equal(authority.prerequisiteChain.at(-1).knowledgePointId, 'kp_g5b_u04_decimal_times_decimal');
});

test('P03F49 authority keeps the source witness gap explicit after operator approval', () => {
  assert.equal(authority.sourceAuthority.sourceSha256, sourceResolution.sourceAuthority.sourceSha256);
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1]);
  assert.equal(authority.sourceAuthority.applicationDirectTextbookWitness, false);
  assert.equal(authority.sourceAuthority.estimationDirectTextbookWitness, false);
  assert.equal(authority.sourceAuthority.textbookDirectWitnessClaimAdded, false);
  assert.equal(authority.sourceAuthority.operatorApprovalDate, '2026-08-22');
  assert.equal(reconciliation.operatorApproval.approved, true);
  assert.equal(reconciliation.operatorApproval.doesNotRewriteSourceEvidence, true);
});

test('P03F49 application FormalMapping is exact decimal multiplication with APPLICATION surface', () => {
  const kp = authority.knowledgePoints.find((row) => row.knowledgePointId === APPLICATION_KP);
  const mapping = authority.formalMappings.find((row) => row.knowledgePointId === APPLICATION_KP);
  const surface = authority.patternSurfaces.find((row) => row.knowledgePointId === APPLICATION_KP);

  assert.ok(kp);
  assert.ok(mapping);
  assert.ok(surface);
  assert.equal(kp.prerequisiteKnowledgePointId, 'kp_g5b_u04_decimal_times_decimal');
  assert.equal(kp.operationFamilyId, 'decimal_multiplication');
  assert.deepEqual(kp.requiredW3CapabilityIds, REQUIRED_CAPABILITIES);
  assert.equal(kp.directTextbookWitness, false);

  assert.equal(mapping.formalMappingId, 'fm_g5b_u04_decimal_multiplication_application');
  assert.deepEqual(mapping.canonicalExpressions, ['product = leftDecimalFactor * rightDecimalFactor']);
  assert.deepEqual(mapping.unknownRoles, ['product']);
  assert.equal(mapping.answerType, 'decimal');

  assert.equal(surface.patternGroupId, 'pg_g5b_u04_decimal_multiplication_application');
  assert.equal(surface.patternSpecId, 'ps_g5b_u04_decimal_multiplication_application_product_application');
  assert.equal(surface.mode, 'APPLICATION');
  assert.equal(surface.requestedUnknownRole, 'product');
  assert.deepEqual(surface.givenRoles, ['leftDecimalFactor', 'rightDecimalFactor']);
  assert.equal(surface.contextRequired, true);
  assert.equal(surface.globalContextExpansionRequired, false);
});

test('P03F49 estimation FormalMapping specializes canonical round-then-operate to multiplication', () => {
  const kp = authority.knowledgePoints.find((row) => row.knowledgePointId === ESTIMATION_KP);
  const mapping = authority.formalMappings.find((row) => row.knowledgePointId === ESTIMATION_KP);
  const surface = authority.patternSurfaces.find((row) => row.knowledgePointId === ESTIMATION_KP);
  const example = authority.operatorApprovedExamples.find((row) => row.knowledgePointId === ESTIMATION_KP);

  assert.ok(kp);
  assert.ok(mapping);
  assert.ok(surface);
  assert.equal(kp.prerequisiteKnowledgePointId, 'kp_g5b_u04_decimal_times_decimal');
  assert.equal(kp.operationFamilyId, 'decimal_multiplication');
  assert.deepEqual(kp.requiredW3CapabilityIds, REQUIRED_CAPABILITIES);
  assert.equal(kp.directTextbookWitness, false);

  assert.deepEqual(mapping.canonicalExpressions, [
    'roundedLeft = roundToPlace(leftDecimalFactor, ones)',
    'roundedRight = roundToPlace(rightDecimalFactor, ones)',
    'estimate = roundedLeft * roundedRight'
  ]);
  assert.deepEqual(mapping.unknownRoles, ['estimate']);
  assert.equal(mapping.answerType, 'decimal');

  assert.equal(surface.patternGroupId, 'pg_g5b_u04_decimal_multiplication_estimation_numeric');
  assert.equal(surface.patternSpecId, 'ps_g5b_u04_decimal_multiplication_estimation_estimate_numeric');
  assert.equal(surface.mode, 'NUMERIC');
  assert.equal(surface.requestedUnknownRole, 'estimate');
  assert.deepEqual(surface.givenRoles, ['leftDecimalFactor', 'rightDecimalFactor']);
  assert.equal(surface.contextRequired, false);

  assert.equal(authority.validatorContract.estimation.roundingTarget, 'ones');
  assert.equal(authority.validatorContract.estimation.roundingRule, 'HALF_UP');
  assert.equal(authority.validatorContract.estimation.exactRoundedFactorMultiplicationRequired, true);
  assert.equal(example.derivation, '13 × 4');
  assert.equal(example.answer, '52');
  assert.equal(example.textbookDirectWitness, false);
});

test('P03F49 authority freezes capability, inventory, and implementation boundary without q050/793 expansion', () => {
  assert.deepEqual(authority.capabilityContract.requiredW3CapabilityUnion, REQUIRED_CAPABILITIES);
  assert.equal(authority.capabilityContract.newCapabilityIdRequired, false);
  assert.equal(authority.capabilityContract.sharedDecimalMultiplicationFamilyRequired, true);
  assert.equal(authority.capabilityContract.sharedRoundingSemanticsReused, true);

  assert.equal(authority.publicProjection.publicSourceCountBefore, 33);
  assert.equal(authority.publicProjection.publicSourceCountAfter, 33);
  assert.equal(authority.publicProjection.currentPublicKnowledgePointCountBefore, 249);
  assert.equal(authority.publicProjection.currentPublicKnowledgePointCountAfter, 251);
  assert.equal(authority.publicProjection.g5bU04VisibleKnowledgePointsBefore, 3);
  assert.equal(authority.publicProjection.g5bU04VisibleKnowledgePointsAfter, 5);
  assert.equal(authority.publicProjection.g5bU04HiddenKnowledgePointsAfter, 0);
  assert.equal(authority.publicProjection.g5bU04NotSelectableKnowledgePointsAfter, 0);

  assert.equal(authority.implementationBoundary.authorityFreezeComplete, true);
  assert.equal(authority.implementationBoundary.implementationBranchMayStart, true);
  assert.equal(authority.implementationBoundary.globalContextExpansionAllowed, false);
  assert.equal(authority.implementationBoundary.q050Included, false);
  assert.equal(authority.implementationBoundary.parallelPipelineAllowed, false);
  assert.equal(authority.implementationBoundary.changeImpactGate, 'L3');
  assert.equal(authority.implementationBoundary.targetedRouteReplayRequired, true);
  assert.equal(authority.implementationBoundary.full793RouteReplayRequired, false);
  assert.equal(
    authority.implementationBoundary.nextTask,
    'P03F49_G5BU04Rank11ApplicationEstimationImplementation'
  );
});

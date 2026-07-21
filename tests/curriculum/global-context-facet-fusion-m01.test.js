import assert from 'node:assert/strict';
import test from 'node:test';
import {
  loadGlobalContextAuthority,
  queryAtomicTaskEpisodes,
  resolveLegacyContextFamily,
  validateGlobalContextAuthority
} from '../../src/curriculum/context/global-context-ontology-resolver.mjs';
import { runGlobalContextFacetFusionValidation } from '../../tools/curriculum/validate-global-context-facet-fusion.mjs';

const authority = loadGlobalContextAuthority();
const codes = (result) => result.issues.map((row) => row.code);

test('M01 materializes the exact connectable bootstrap', () => {
  const result = runGlobalContextFacetFusionValidation();
  assert.equal(result.status, 'PASS_POSTG_APP_M01_GLOBAL_CONTEXT_FACET_FUSION', JSON.stringify(result.issues, null, 2));
  assert.deepEqual(result.counts, {
    macroDomainCount: 16,
    mesoSituationCount: 48,
    microScenarioCount: 48,
    atomicEpisodeCount: 96,
    surfaceRealizationCount: 96,
    facetCount: 48,
    legacyFamilyMappingCount: 18,
    productionAdmittedNodeCount: 0
  });
});

test('all 18 legacy families map exactly once', () => {
  const legacyIds = authority.legacyRegistry.contextFamilies.map((row) => row.contextFamilyId).sort();
  const mappingIds = authority.legacyMappingRegistry.mappings.map((row) => row.legacyContextFamilyId).sort();
  assert.equal(legacyIds.length, 18);
  assert.deepEqual(mappingIds, legacyIds);
  assert.equal(authority.legacyMappingRegistry.mappings.every((row) => row.automaticLevelInferenceUsed === false), true);
  assert.equal(authority.legacyMappingRegistry.mappings.every((row) => row.productionAdmissionGranted === false), true);
});

test('legacy transit family resolves through the full hierarchy', () => {
  const resolved = resolveLegacyContextFamily(authority, 'gctx_family_transit_trip_capacity');
  assert.equal(resolved.macro.nodeId, 'gctx_macro_transport_mobility');
  assert.equal(resolved.meso.nodeId, 'gctx_meso_field_trip_transport');
  assert.equal(resolved.micro.nodeId, 'gctx_micro_student_vehicle_allocation');
  assert.equal(resolved.episodes.length, 2);
});

test('ancient historical current-affairs and SDG queries return episodes', () => {
  assert.equal(queryAtomicTaskEpisodes(authority, { facetId: 'facet_time_ancient' }).length >= 2, true);
  assert.equal(queryAtomicTaskEpisodes(authority, { facetId: 'facet_time_historical' }).length >= 2, true);
  assert.equal(queryAtomicTaskEpisodes(authority, { facetId: 'facet_time_current_affairs' }).length >= 2, true);
  assert.equal(queryAtomicTaskEpisodes(authority, { facetId: 'facet_sdg_06' }).length >= 2, true);
  assert.equal(queryAtomicTaskEpisodes(authority, {
    facetIds: ['facet_time_current_affairs', 'facet_sdg_06'],
    sourcePolicy: 'CURRENT_AFFAIRS_SOURCE_REQUIRED'
  }).length >= 2, true);
});

test('surface wording stays outside ontology identity', () => {
  assert.equal(authority.surfaceRealizations.length, 96);
  assert.equal(authority.surfaceRealizations.every((row) => row.createsNewScenarioIdentity === false), true);
  assert.equal(authority.surfaceRealizations.every((row) => row.productionSelectable === false), true);
  assert.equal(authority.hierarchy.atomicTaskEpisodes.every((row) => row.semanticFingerprintComponents.includes('atomicEpisodeId')), true);
});

test('parent facet and legacy coverage failures are blocking', () => {
  const parentCase = structuredClone(authority);
  parentCase.hierarchy.microEventScenarios[0].parentNodeId = 'gctx_meso_missing';
  assert.equal(codes(validateGlobalContextAuthority(parentCase)).includes('GCTX_PARENT_NOT_FOUND'), true);

  const facetCase = structuredClone(authority);
  facetCase.hierarchy.atomicTaskEpisodes[0].facetRefs.push('facet_missing');
  assert.equal(codes(validateGlobalContextAuthority(facetCase)).includes('GCTX_FACET_NOT_FOUND'), true);

  const mappingCase = structuredClone(authority);
  mappingCase.legacyMappingRegistry.mappings.pop();
  const mappingCodes = codes(validateGlobalContextAuthority(mappingCase));
  assert.equal(mappingCodes.includes('GCTX_LEGACY_MAPPING_COVERAGE_MISMATCH'), true);
  assert.equal(mappingCodes.includes('GCTX_COVERAGE_COUNT_MISMATCH'), true);
});

test('current-affairs nodes require anchors and freshness facets', () => {
  const changed = structuredClone(authority);
  const episode = changed.hierarchy.atomicTaskEpisodes.find((row) => row.sourcePolicy === 'CURRENT_AFFAIRS_SOURCE_REQUIRED');
  episode.currentAffairsAnchorRefs = [];
  episode.facetRefs = episode.facetRefs.filter((id) => id !== 'facet_freshness_current_snapshot');
  const resultCodes = codes(validateGlobalContextAuthority(changed));
  assert.equal(resultCodes.includes('GCTX_CURRENT_AFFAIRS_ANCHOR_MISSING'), true);
  assert.equal(resultCodes.includes('GCTX_CURRENT_AFFAIRS_FACET_MISSING'), true);
});

test('M01 keeps every context node outside production admission', () => {
  const changed = structuredClone(authority);
  changed.hierarchy.atomicTaskEpisodes[0].lifecycle = 'PRODUCTION_ADMITTED';
  const resultCodes = codes(validateGlobalContextAuthority(changed));
  assert.equal(resultCodes.includes('GCTX_M01_PRODUCTION_NODE_FORBIDDEN'), true);
  assert.equal(resultCodes.includes('GCTX_COVERAGE_COUNT_MISMATCH'), true);
});

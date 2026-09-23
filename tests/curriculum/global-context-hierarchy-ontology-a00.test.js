import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const index = readJson('data/curriculum/context/registry/global-context-authority-index.json');
const ontology = readJson('data/curriculum/context/registry/global-context-hierarchy-ontology.json');
const schema = readJson('data/curriculum/context/schema/global-context-hierarchy-node.schema.json');
const contract = readJson('data/curriculum/context/contracts/GCTX-HIER-A00_AuthorityIndexAndExtractionContract.json');
const claim = readJson('data/project/milestones/GCTX-HIER-A00.claim.json');
const legacy = readJson('data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json');

test('one canonical extraction entry point resolves fused ontology before legacy seeds', () => {
  assert.equal(index.status, 'CANONICAL_EXTRACTION_ENTRY_POINT_BOOTSTRAP_FACET_FUSED');
  assert.equal(index.canonicalEntryPoint, 'data/curriculum/context/registry/global-context-authority-index.json');
  assert.deepEqual(index.authorityOrder.map((row) => row.priority), Array.from({ length: 14 }, (_, indexValue) => indexValue + 1));
  assert.equal(index.authorityOrder[1].role, 'FACET_FUSION_AND_POPULATION_CONTRACT');
  assert.equal(index.authorityOrder[2].role, 'MACHINE_READABLE_ONTOLOGY_STATE');
  assert.equal(index.authorityOrder[6].role, 'EXPLICIT_LEGACY_MAPPING');
  assert.equal(index.authorityOrder[11].role, 'LEGACY_FLAT_SEED_SOURCE');
});

test('four hierarchy levels are distinct from wording and numeric instances', () => {
  assert.deepEqual(ontology.hierarchyLevels.map((row) => row.nodeType), [
    'MACRO_CONTEXT_DOMAIN',
    'MESO_SITUATION_FAMILY',
    'MICRO_EVENT_SCENARIO',
    'ATOMIC_TASK_EPISODE'
  ]);
  assert.deepEqual(ontology.hierarchyLevels.map((row) => row.labelZh), ['大情境', '中情境', '小情境', '微觀情境']);
  assert.equal(ontology.hierarchyLevels[3].primaryGeneratorSelectionUnit, true);
  assert.deepEqual(ontology.nonOntologyLayers.map((row) => row.type), ['SURFACE_REALIZATION', 'NUMERIC_INSTANCE']);
  assert.equal(ontology.nonOntologyLayers.every((row) => row.createsNewScenarioIdentity === false), true);
});

test('node schema locks parent prefixes, facets and atomic semantic evidence', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.allOf[0].then.properties.parentNodeId.const, null);
  assert.equal(schema.allOf[1].then.properties.parentNodeId.pattern, '^gctx_macro_');
  assert.equal(schema.allOf[2].then.properties.parentNodeId.pattern, '^gctx_meso_');
  assert.equal(schema.allOf[3].then.properties.parentNodeId.pattern, '^gctx_micro_');
  assert.equal(schema.allOf[3].then.required.includes('compatibleOperationFamilies'), true);
  assert.equal(schema.allOf[3].then.required.includes('facetRefs'), true);
  assert.equal(schema.allOf[3].then.required.includes('sourcePolicy'), true);
  assert.equal(schema.allOf[3].then.required.includes('semanticFingerprintComponents'), true);
});

test('GS02 remains an 18-entry legacy seed and is explicitly mapped without becoming the universe', () => {
  assert.equal(legacy.schemaName, 'GS02G5AU08GlobalContextFamilyRegistry');
  assert.equal(legacy.contextFamilies.length, 18);
  const mapping = ontology.legacyRegistryMappings[0];
  assert.equal(mapping.authoritativeRole, 'LEGACY_FLAT_CONTEXT_FAMILY_AND_SURFACE_TEMPLATE_SEED_REGISTRY');
  assert.equal(mapping.completeGlobalContextUniverse, false);
  assert.equal(mapping.contextFamilyCountIsScenarioCapacity, false);
  assert.equal(mapping.surfaceTemplatesAreHierarchyNodes, false);
  assert.equal(mapping.automaticHierarchyLevelInferenceAllowed, false);
  assert.equal(mapping.mappingStatus, '18_OF_18_EXPLICITLY_MAPPED_TO_V1_BOOTSTRAP');
  assert.equal(mapping.productionAdmissionGranted, false);
});

test('retrieval aliases expose hierarchy and facet terms in Chinese and English', () => {
  for (const alias of ['全域情境', '大情境', '中情境', '小情境', '微觀情境', '情境本體', 'SDG情境', '古代情境', '時事情境']) {
    assert.equal(index.extractionAliases.zhTW.includes(alias), true);
  }
  for (const alias of ['global context', 'context hierarchy', 'atomic task episode', 'temporal lens', 'current affairs context']) {
    assert.equal(index.extractionAliases.en.includes(alias), true);
  }
  assert.equal(index.prohibitedInferences.includes('18 legacy context families equals 18 total student-visible contexts'), true);
  assert.equal(index.prohibitedInferences.includes('bootstrap population means the global context universe is complete'), true);
});

test('M01 bootstrap is populated and queryable while the global universe and production remain open', () => {
  assert.equal(ontology.status, 'BOOTSTRAP_POPULATED_FACET_FUSED_SHADOW_RESOLVABLE');
  assert.deepEqual(ontology.population, {
    materializationMode: 'DETERMINISTIC_FROM_VERSIONED_SEEDS',
    macroDomainCount: 16,
    mesoSituationCount: 48,
    microScenarioCount: 48,
    atomicEpisodeCount: 96,
    surfaceRealizationCount: 96,
    facetCount: 48,
    legacyMappingCount: 18,
    productionAdmittedNodeCount: 0,
    globalUniverseClosed: false
  });
  assert.equal(ontology.completeness.bootstrapMacroPopulationComplete, true);
  assert.equal(ontology.completeness.bootstrapMesoPopulationComplete, true);
  assert.equal(ontology.completeness.bootstrapMicroPopulationComplete, true);
  assert.equal(ontology.completeness.bootstrapAtomicEpisodePopulationComplete, true);
  assert.equal(ontology.completeness.knownLegacyGS02MappingComplete, true);
  assert.equal(ontology.completeness.globalContextUniverseComplete, false);
  assert.equal(ontology.completeness.applicationBindingMigrationComplete, false);
  assert.equal(ontology.completeness.productionRuntimeConsumptionComplete, false);
});

test('A00 historical milestone remains E1 and is superseded rather than rewritten', () => {
  assert.equal(contract.result.hierarchySemanticsDefined, true);
  assert.equal(contract.result.hierarchyNodesPopulated, false);
  assert.equal(contract.result.runtimeChanged, false);
  assert.equal(contract.result.productionAdmissionChanged, false);
  for (const [key, value] of Object.entries(contract.scope)) {
    if (key === 'primaryPRLimit') assert.equal(value, 1);
    else assert.equal(value, false, `${key} must remain false`);
  }
  assert.equal(claim.actualEvidenceLevel, 'E1_DATA_STRUCTURE_READY');
  assert.equal(claim.claims.runtimeIntegrated, false);
  assert.equal(claim.claims.productionAdmitted, false);
  assert.equal(claim.nextStep.taskId, 'POSTG-APP-A00_ProgramControllerCapabilityBaselineAndFixedQueue');
  assert.equal(claim.nextStep.requiredContractId, 'GLOBAL_CONTEXT_HIERARCHY_ONTOLOGY_V1');
  assert.equal(ontology.nextProgramConsumer.producerTask, 'POSTG-APP-M01_GlobalContextOntologyFacetFusionPopulationAndLegacyMapping');
});
